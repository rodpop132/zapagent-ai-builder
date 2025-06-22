
import { Button } from "@/components/ui/button";
import { Check, X, Crown, Zap } from "lucide-react";
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

  const freePlanFeatures = [
    { text: 'Apenas 30 mensagens por mês', included: true, limited: true },
    { text: 'Somente 1 agente IA', included: true, limited: true },
    { text: 'Suporte básico por email', included: true, limited: true },
    { text: 'Funcionalidades limitadas', included: true, limited: true },
    { text: 'Sem análise de conversas', included: false },
    { text: 'Sem rastreamento de mensagens', included: false },
    { text: 'Sem métricas em tempo real', included: false },
    { text: 'Sem atualização automática', included: false },
  ];

  const proPlanFeatures = [
    { text: '1.000 mensagens por mês', included: true },
    { text: 'Até 3 agentes IA', included: true },
    { text: 'Suporte prioritário', included: true },
    { text: 'Análise detalhada de conversas', included: true },
    { text: 'Rastreamento completo de mensagens', included: true },
    { text: 'Métricas em tempo real', included: true },
    { text: 'Auto-refresh a cada 30 segundos', included: true },
    { text: 'Integração WhatsApp Business', included: true },
    { text: 'Relatórios de performance', included: true },
  ];

  const ultraPlanFeatures = [
    { text: 'Mensagens ILIMITADAS', included: true },
    { text: 'Agentes IA ILIMITADOS', included: true },
    { text: 'Suporte VIP 24/7', included: true },
    { text: 'IA com memória avançada', included: true },
    { text: 'Rastreamento avançado em tempo real', included: true },
    { text: 'Dashboard executivo completo', included: true },
    { text: 'Atualização automática instantânea', included: true },
    { text: 'Análise preditiva de conversas', included: true },
    { text: 'API personalizada', included: true },
    { text: 'White label disponível', included: true },
    { text: 'Gerente de conta dedicado', included: true },
  ];

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
          {/* Plano Gratuito - Limitado */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md border border-gray-200 relative opacity-75">
            <div className="absolute top-3 right-3">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                Limitado
              </span>
            </div>
            
            <div className="text-center mb-4 md:mb-6 lg:mb-8">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700 mb-2">Gratuito</h3>
              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-600">R$ 0</span>
                <span className="text-gray-500 ml-1 md:ml-2 text-sm md:text-base">/mês</span>
              </div>
              <p className="text-xs md:text-sm lg:text-base text-gray-500 px-2">Para testar o básico</p>
            </div>
            
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mb-4 md:mb-6 lg:mb-8 min-h-[250px]">
              {freePlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  {feature.included ? (
                    <Check className={`h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0 mt-0.5 ${
                      feature.limited ? 'text-orange-500' : 'text-green-600'
                    }`} />
                  ) : (
                    <X className="h-4 w-4 md:h-5 md:w-5 text-red-500 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`text-xs md:text-sm lg:text-base leading-relaxed ${
                    feature.included ? (feature.limited ? 'text-orange-600' : 'text-gray-700') : 'text-gray-400 line-through'
                  }`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-gray-600 hover:bg-gray-700 text-white text-xs md:text-sm lg:text-base py-2 md:py-3"
              onClick={() => handlePlanClick('free')}
            >
              Começar Grátis
            </Button>
          </div>

          {/* Plano Pro - Destaque */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-brand-green relative transform scale-105">
            {/* Badge superior */}
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              + 7 dias grátis
            </div>
            
            {/* Badge "Most Popular" + "PROMOÇÃO" */}
            <div className="absolute -top-2 md:-top-3 lg:-top-4 -right-2">
              <div className="bg-brand-green text-white px-2 md:px-3 lg:px-4 py-1 md:py-2 rounded-full text-xs font-medium flex items-center space-x-1 md:space-x-2">
                <Crown className="h-3 w-3" />
                <span className="hidden sm:inline">MAIS POPULAR</span>
                <span className="bg-white text-brand-green px-1 md:px-2 py-0.5 md:py-1 rounded text-xs font-bold">-50%</span>
              </div>
            </div>
            
            <div className="text-center mb-4 md:mb-6 lg:mb-8 mt-4 md:mt-0">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-brand-dark mb-2 flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-brand-green" />
                Profissional
              </h3>
              <div className="mb-2">
                <span className="text-sm md:text-base lg:text-lg text-gray-500 line-through">R$ 159</span>
                <span className="text-xs bg-red-100 text-red-600 px-1 md:px-2 py-0.5 md:py-1 rounded ml-1 md:ml-2 font-bold">50% OFF</span>
              </div>
              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-green">R$ 79</span>
                <span className="text-brand-gray ml-1 md:ml-2 text-sm md:text-base">/mês</span>
              </div>
              <p className="text-xs md:text-sm lg:text-base text-brand-gray px-2 font-medium">Ideal para pequenas e médias empresas</p>
              <p className="text-xs text-gray-500 mt-2 italic">Experimente 7 dias grátis!</p>
            </div>
            
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mb-4 md:mb-6 lg:mb-8 min-h-[250px]">
              {proPlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-brand-green mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm lg:text-base text-brand-gray leading-relaxed font-medium">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white text-xs md:text-sm lg:text-base py-3 md:py-4 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              onClick={() => handlePlanClick('pro')}
            >
              Escolher Profissional
            </Button>
          </div>

          {/* Plano Ultra - Premium */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-purple-500 relative md:col-span-2 lg:col-span-1">
            {/* Badge superior */}
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              + 7 dias grátis
            </div>
            
            {/* Badge "EMPRESARIAL" */}
            <div className="absolute -top-2 md:-top-3 lg:-top-4 -right-2">
              <div className="bg-purple-600 text-white px-2 md:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Zap className="h-3 w-3" />
                EMPRESARIAL
              </div>
            </div>
            
            <div className="text-center mb-4 md:mb-6 lg:mb-8">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-purple-900 mb-2 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Ultra Premium
              </h3>
              <div className="mb-2">
                <span className="text-sm md:text-base lg:text-lg text-gray-500 line-through">R$ 359</span>
                <span className="text-xs bg-red-100 text-red-600 px-1 md:px-2 py-0.5 md:py-1 rounded ml-1 md:ml-2 font-bold">50% OFF</span>
              </div>
              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-600">R$ 179</span>
                <span className="text-purple-700 ml-1 md:ml-2 text-sm md:text-base">/mês</span>
              </div>
              <p className="text-xs md:text-sm lg:text-base text-purple-700 px-2 font-medium">Para empresas que querem dominar</p>
              <p className="text-xs text-purple-600 mt-2 italic font-medium">Sem limites. Máximo poder!</p>
            </div>
            
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mb-4 md:mb-6 lg:mb-8 min-h-[250px]">
              {ultraPlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm lg:text-base text-purple-800 leading-relaxed font-medium">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs md:text-sm lg:text-base py-3 md:py-4 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              onClick={() => handlePlanClick('ultra')}
            >
              Escolher Ultra Premium
            </Button>
          </div>
        </div>

        <div className="text-center mt-6 md:mt-8 lg:mt-12 px-4">
          <p className="text-xs md:text-sm lg:text-base text-brand-dark font-medium">
            Todos os planos incluem atualizações automáticas e novos recursos
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
