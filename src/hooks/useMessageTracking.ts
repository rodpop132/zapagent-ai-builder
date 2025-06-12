
import { useState, useEffect } from 'react';
import { ZapAgentService } from '@/services/zapAgentService';
import { useAuth } from '@/hooks/useAuth';

interface UseMessageTrackingProps {
  phoneNumber: string;
  intervalMs?: number;
}

interface MessageStats {
  mensagensUsadas: number;
  plano: string;
  agentesAtivos: number;
}

export const useMessageTracking = ({ phoneNumber, intervalMs = 30000 }: UseMessageTrackingProps) => {
  const { user } = useAuth();
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessageStats = async () => {
    if (!user?.id || !phoneNumber) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ZapAgentService.getMessagesUsed(user.id, phoneNumber);
      
      if (response) {
        setMessageStats({
          mensagensUsadas: response.mensagensUsadas,
          plano: response.plano,
          agentesAtivos: response.agentesAtivos
        });
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar estatísticas de mensagens:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Buscar imediatamente ao montar
    fetchMessageStats();
    
    // Configurar intervalo para atualizações automáticas
    const interval = setInterval(fetchMessageStats, intervalMs);
    
    return () => clearInterval(interval);
  }, [user?.id, phoneNumber, intervalMs]);

  return {
    messageStats,
    isLoading,
    error,
    refetch: fetchMessageStats
  };
};
