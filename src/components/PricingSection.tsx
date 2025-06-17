import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFacebookTracking } from '@/hooks/useFacebookTracking';

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { trackInitiateCheckout } = useFacebookTracking();

  // Detectar país baseado no idioma
  const getCountryFromLanguage = () => {
    switch (i18n.language) {
      case 'pt': return 'brasil';
      case 'es': return 'spain';
      case 'en': 
      default: return 'usa';
    }
  };

  const handlePlanClick = async (planType: string) => {
    if (planType === 'free') {
      if (user) {
        navigate('/dashboard');
      } else {
        // Redirecionar para cadastro em vez de login para plano gratuito
        navigate('/auth');
      }
      return;
    }

    // Para planos pagos, usar Stripe
    try {
      const country = getCountryFromLanguage();
      
      // Track checkout initiation with Facebook
      const planPrices = {
        pro: country === 'brasil' ? 79 : country === 'spain' ? 12 : 15,
        ultra: country === 'brasil' ? 179 : country === 'spain' ? 28 : 37,
      };
      
      const currency = country === 'brasil' ? 'BRL' : country === 'spain' ? 'EUR' : 'USD';
      const price = planPrices[planType as keyof typeof planPrices];
      
      await trackInitiateCheckout(price, currency, user?.email);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType: planType,
          country: country,
          guestCheckout: !user // Se não estiver autenticado, fazer checkout como convidado
        }
      });

      if (error) {
        console.error('Erro ao criar checkout:', error);
        throw error;
      }

      if (data?.url) {
        // Abrir checkout do Stripe em nova aba
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL do checkout não retornada');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error(
        i18n.language === 'pt' ? 'Erro ao processar pagamento. Tente novamente.' :
        i18n.language === 'es' ? 'Error al procesar el pago. Inténtalo de nuevo.' :
        'Error processing payment. Please try again.'
      );
    }
  };

  return (
    <section id="planos" className="py-8 md:py-16 lg:py-20 px-3 md:px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-dark mb-3 md:mb-4 px-2">
            {t('pricing.title')}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-brand-gray px-4">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Plano Gratuito */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="text-center mb-4 md:mb-6 lg:mb-8">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-brand-dark mb-2">{t('pricing.free.title')}</h3>
              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-dark">{t('pricing.free.price')}</span>
                <span className="text-brand-gray ml-1 md:ml-2 text-sm md:text-base">{t('pricing.free.period')}</span>
              </div>
              <p className="text-xs md:text-sm lg:text-base text-brand-gray px-2">{t('pricing.free.description')}</p>
            </div>
            
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
              {(t('pricing.free.features', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-brand-green mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm lg:text-base text-brand-gray leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white text-xs md:text-sm lg:text-base py-2 md:py-3"
              onClick={() => handlePlanClick('free')}
            >
              {t('pricing.free.cta')}
            </Button>
          </div>

          {/* Plano Pro */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-brand-green relative">
            {/* Badge "+ 7 dias grátis" no canto superior esquerdo */}
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {t('pricing.freeTrial')}
            </div>
            
            {/* Badge "Most Popular" + "PROMOTION" no canto superior direito */}
            <div className="absolute -top-2 md:-top-3 lg:-top-4 -right-2">
              <div className="bg-brand-green text-white px-2 md:px-3 lg:px-4 py-1 md:py-2 rounded-full text-xs font-medium flex items-center space-x-1 md:space-x-2">
                <span className="hidden sm:inline">{t('pricing.pro.popular')}</span>
                <span className="bg-white text-brand-green px-1 md:px-2 py-0.5 md:py-1 rounded text-xs">{t('pricing.pro.promotion')}</span>
              </div>
            </div>
            
            <div className="text-center mb-4 md:mb-6 lg:mb-8 mt-4 md:mt-0">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-brand-dark mb-2">{t('pricing.pro.title')}</h3>
              <div className="mb-2">
                <span className="text-sm md:text-base lg:text-lg text-brand-gray line-through">{t('pricing.pro.originalPrice')}</span>
                <span className="text-xs bg-red-100 text-red-600 px-1 md:px-2 py-0.5 md:py-1 rounded ml-1 md:ml-2">{t('pricing.pro.discount')}</span>
              </div>
              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-green">{t('pricing.pro.price')}</span>
                <span className="text-brand-gray ml-1 md:ml-2 text-sm md:text-base">{t('pricing.pro.period')}</span>
              </div>
              <p className="text-xs md:text-sm lg:text-base text-brand-gray px-2">{t('pricing.pro.description')}</p>
              <p className="text-xs text-gray-500 mt-2 italic">{t('pricing.freeTrialNote')}</p>
            </div>
            
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
              {(t('pricing.pro.features', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-brand-green mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm lg:text-base text-brand-gray leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white text-xs md:text-sm lg:text-base py-2 md:py-3"
              onClick={() => handlePlanClick('pro')}
            >
              {t('pricing.pro.cta')}
            </Button>
          </div>

          {/* Plano Ultra */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 relative md:col-span-2 lg:col-span-1">
            {/* Badge "+ 7 dias grátis" no canto superior esquerdo */}
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {t('pricing.freeTrial')}
            </div>
            
            {/* Badge "PROMOTION" no canto superior direito */}
            <div className="absolute -top-2 md:-top-3 lg:-top-4 -right-2">
              <div className="bg-purple-600 text-white px-2 md:px-3 py-1 rounded-full text-xs font-medium">
                {t('pricing.ultra.promotion')}
              </div>
            </div>
            
            <div className="text-center mb-4 md:mb-6 lg:mb-8">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-brand-dark mb-2">{t('pricing.ultra.title')}</h3>
              <div className="mb-2">
                <span className="text-sm md:text-base lg:text-lg text-brand-gray line-through">{t('pricing.ultra.originalPrice')}</span>
                <span className="text-xs bg-red-100 text-red-600 px-1 md:px-2 py-0.5 md:py-1 rounded ml-1 md:ml-2">{t('pricing.ultra.discount')}</span>
              </div>
              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-600">{t('pricing.ultra.price')}</span>
                <span className="text-brand-gray ml-1 md:ml-2 text-sm md:text-base">{t('pricing.ultra.period')}</span>
              </div>
              <p className="text-xs md:text-sm lg:text-base text-brand-gray px-2">{t('pricing.ultra.description')}</p>
              <p className="text-xs text-gray-500 mt-2 italic">{t('pricing.freeTrialNote')}</p>
            </div>
            
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
              {(t('pricing.ultra.features', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm lg:text-base text-brand-gray leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm lg:text-base py-2 md:py-3"
              onClick={() => handlePlanClick('ultra')}
            >
              {t('pricing.ultra.cta')}
            </Button>
          </div>
        </div>

        <div className="text-center mt-6 md:mt-8 lg:mt-12 px-4">
          <p className="text-xs md:text-sm lg:text-base text-brand-gray mb-2 md:mb-4">{t('pricing.guarantee')}</p>
          <p className="text-xs md:text-sm lg:text-base text-brand-dark font-medium">{t('pricing.comingSoon')}</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
