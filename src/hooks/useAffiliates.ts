
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  name: string;
  email: string;
  phone?: string;
  instagram_handle?: string;
  youtube_channel?: string;
  other_social?: string;
  commission_rate: number;
  total_earnings: number;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface AffiliateStats {
  clicks: number;
  conversions: number;
  earnings: number;
}

export const useAffiliates = () => {
  const { user, loading: authLoading } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [stats, setStats] = useState<AffiliateStats>({ clicks: 0, conversions: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  // Buscar dados do afiliado
  const fetchAffiliate = async () => {
    if (!user) {
      setAffiliate(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Buscando afiliado para user:', user.id);
      
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar afiliado:', error);
        setAffiliate(null);
        return;
      }

      if (data) {
        console.log('Afiliado encontrado:', data);
        const affiliateData = {
          ...data,
          status: data.status as 'pending' | 'active' | 'suspended'
        };
        setAffiliate(affiliateData);
      } else {
        console.log('Nenhum afiliado encontrado');
        setAffiliate(null);
      }
    } catch (error) {
      console.error('Erro ao buscar afiliado:', error);
      setAffiliate(null);
    } finally {
      setLoading(false);
    }
  };

  // Buscar estatísticas do afiliado
  const fetchStats = async () => {
    if (!affiliate) {
      setStats({ clicks: 0, conversions: 0, earnings: 0 });
      return;
    }

    try {
      console.log('Buscando estatísticas para afiliado:', affiliate.id);
      
      // Buscar cliques
      const { count: clicksCount } = await supabase
        .from('affiliate_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', affiliate.id);

      // Buscar conversões
      const { data: conversions } = await supabase
        .from('affiliate_conversions')
        .select('commission_amount')
        .eq('affiliate_id', affiliate.id)
        .eq('status', 'approved');

      const totalEarnings = conversions?.reduce((sum, conv) => sum + (conv.commission_amount || 0), 0) || 0;

      const newStats = {
        clicks: clicksCount || 0,
        conversions: conversions?.length || 0,
        earnings: totalEarnings
      };
      
      console.log('Estatísticas carregadas:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStats({ clicks: 0, conversions: 0, earnings: 0 });
    }
  };

  // Criar afiliado
  const createAffiliate = async (data: {
    name: string;
    email: string;
    phone?: string;
    instagram_handle?: string;
    youtube_channel?: string;
    other_social?: string;
  }) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setLoading(true);
      console.log('Criando afiliado para user:', user.id);
      
      // Gerar código único
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_affiliate_code');

      if (codeError) {
        console.error('Erro ao gerar código:', codeError);
        throw codeError;
      }

      console.log('Código gerado:', codeData);

      const { data: newAffiliate, error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          affiliate_code: codeData,
          ...data
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir afiliado:', error);
        throw error;
      }

      if (newAffiliate) {
        console.log('Afiliado criado:', newAffiliate);
        const affiliateData = {
          ...newAffiliate,
          status: newAffiliate.status as 'pending' | 'active' | 'suspended'
        };
        setAffiliate(affiliateData);
        return affiliateData;
      }
    } catch (error) {
      console.error('Erro ao criar afiliado:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Registrar clique
  const trackClick = async (affiliateCode: string) => {
    try {
      const { data: affiliateData } = await supabase
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', affiliateCode)
        .single();

      if (!affiliateData) return;

      await supabase
        .from('affiliate_clicks')
        .insert({
          affiliate_id: affiliateData.id,
          ip_address: '', 
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
        });
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      console.log('Auth loading finished, user:', user ? 'exists' : 'null');
      fetchAffiliate();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (affiliate) {
      fetchStats();
    }
  }, [affiliate]);

  return {
    affiliate,
    stats,
    loading: loading || authLoading,
    createAffiliate,
    trackClick,
    refetch: fetchAffiliate
  };
};
