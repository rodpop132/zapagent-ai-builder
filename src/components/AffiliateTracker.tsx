
import { useEffect } from 'react';
import { useAffiliates } from '@/hooks/useAffiliates';

const AffiliateTracker = () => {
  const { trackClick } = useAffiliates();

  useEffect(() => {
    // Verificar se há parâmetro de afiliado na URL
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateCode = urlParams.get('afiliado');

    if (affiliateCode) {
      // Salvar código do afiliado no localStorage para rastreamento posterior
      localStorage.setItem('affiliate_code', affiliateCode);
      
      // Registrar o clique
      trackClick(affiliateCode);
      
      console.log('Clique de afiliado registrado:', affiliateCode);
    }
  }, [trackClick]);

  return null; // Este componente não renderiza nada
};

export default AffiliateTracker;
