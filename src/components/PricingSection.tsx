import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
        navigate('/auth');
      }
      return;
    }

    // Para planos pagos, usar Stripe
    try {
      const country = getCountryFromLanguage();
      
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
    <section id="planos" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-brand-gray">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plano Gratuito */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-brand-dark mb-2">{t('pricing.free.title')}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-brand-dark">{t('pricing.free.price')}</span>
                <span className="text-brand-gray ml-2">{t('pricing.free.period')}</span>
              </div>
              <p className="text-brand-gray">{t('pricing.free.description')}</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.free.features.agents')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.free.features.messages')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.free.features.training')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.free.features.simulator')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.free.features.support')}</span>
              </li>
            </ul>
            
            <Button 
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
              onClick={() => handlePlanClick('free')}
            >
              {t('pricing.free.cta')}
            </Button>
          </div>

          {/* Plano Pro */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-brand-green relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-brand-green text-white px-6 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                <span>{t('pricing.pro.popular')}</span>
                <span className="bg-white text-brand-green px-2 py-1 rounded text-xs">{t('pricing.pro.promotion')}</span>
              </div>
            </div>
            
            <div className="text-center mb-8 mt-4">
              <h3 className="text-2xl font-bold text-brand-dark mb-2">{t('pricing.pro.title')}</h3>
              <div className="mb-2">
                <span className="text-lg text-brand-gray line-through">{t('pricing.pro.originalPrice')}</span>
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded ml-2">{t('pricing.pro.discount')}</span>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-brand-green">{t('pricing.pro.price')}</span>
                <span className="text-brand-gray ml-2">{t('pricing.pro.period')}</span>
              </div>
              <p className="text-brand-gray">{t('pricing.pro.description')}</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.pro.features.agents')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.pro.features.messages')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.pro.features.whatsapp')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.pro.features.analytics')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.pro.features.support')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-brand-green mr-3" />
                <span className="text-brand-gray">{t('pricing.pro.features.customizations')}</span>
              </li>
            </ul>
            
            <Button 
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
              onClick={() => handlePlanClick('pro')}
            >
              {t('pricing.pro.cta')}
            </Button>
          </div>

          {/* Plano Ultra */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 relative">
            <div className="absolute -top-4 right-4">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                {t('pricing.ultra.promotion')}
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-brand-dark mb-2">{t('pricing.ultra.title')}</h3>
              <div className="mb-2">
                <span className="text-lg text-brand-gray line-through">{t('pricing.ultra.originalPrice')}</span>
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded ml-2">{t('pricing.ultra.discount')}</span>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-purple-600">{t('pricing.ultra.price')}</span>
                <span className="text-brand-gray ml-2">{t('pricing.ultra.period')}</span>
              </div>
              <p className="text-brand-gray">{t('pricing.ultra.description')}</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-brand-gray">{t('pricing.ultra.features.agents')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-brand-gray">{t('pricing.ultra.features.messages')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-brand-gray">{t('pricing.ultra.features.analytics')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-brand-gray">{t('pricing.ultra.features.integrations')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-brand-gray">{t('pricing.ultra.features.support')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-brand-gray">{t('pricing.ultra.features.api')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-brand-gray">{t('pricing.ultra.features.telegram')}</span>
              </li>
            </ul>
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => handlePlanClick('ultra')}
            >
              {t('pricing.ultra.cta')}
            </Button>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-brand-gray mb-4">{t('pricing.guarantee')}</p>
          <p className="text-brand-dark font-medium">{t('pricing.comingSoon')}</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
