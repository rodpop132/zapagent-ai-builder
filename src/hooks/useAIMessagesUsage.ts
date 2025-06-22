
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AIMessagesUsage {
  messages_generated: number;
  messages_limit: number;
  can_generate: boolean;
}

export const useAIMessagesUsage = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<AIMessagesUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    if (!user?.id) return;

    try {
      // Buscar assinatura para obter o plano
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', user.id)
        .single();

      const planType = subscription?.plan_type || 'free';

      // Definir limite baseado no plano
      let messagesLimit = 10; // free
      if (planType === 'pro') messagesLimit = 10000;
      if (planType === 'ultra' || planType === 'unlimited') messagesLimit = 999999;

      // Buscar ou criar registro de uso
      let { data: aiUsage } = await supabase
        .from('ai_messages_usage')
        .select('messages_generated')
        .eq('user_id', user.id)
        .single();

      if (!aiUsage) {
        // Criar registro se não existir
        const { data: newUsage } = await supabase
          .from('ai_messages_usage')
          .insert({
            user_id: user.id,
            messages_generated: 0
          })
          .select('messages_generated')
          .single();
        
        aiUsage = newUsage;
      }

      const messagesGenerated = aiUsage?.messages_generated || 0;
      const canGenerate = messagesGenerated < messagesLimit;

      setUsage({
        messages_generated: messagesGenerated,
        messages_limit: messagesLimit,
        can_generate: canGenerate
      });

    } catch (error) {
      console.error('Erro ao buscar uso de mensagens IA:', error);
      setUsage({
        messages_generated: 0,
        messages_limit: 10,
        can_generate: true
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async () => {
    if (!user?.id || !usage) return false;

    try {
      const { error } = await supabase
        .from('ai_messages_usage')
        .upsert({
          user_id: user.id,
          messages_generated: usage.messages_generated + 1,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        setUsage(prev => prev ? {
          ...prev,
          messages_generated: prev.messages_generated + 1,
          can_generate: (prev.messages_generated + 1) < prev.messages_limit
        } : null);
        return true;
      }
    } catch (error) {
      console.error('Erro ao incrementar uso:', error);
    }
    return false;
  };

  useEffect(() => {
    fetchUsage();
  }, [user?.id]);

  return {
    usage,
    loading,
    fetchUsage,
    incrementUsage
  };
};
