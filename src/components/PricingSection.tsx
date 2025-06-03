import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PricingSection = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (planType: string) => {
    // Para plano gratuito, sempre direcionar para login
    if (planType === 'free') {
      navigate('/auth');
      return;
    }

    setLoading(planType);
    
    try {
      let checkoutData;
      
      if (user) {
        // Usuário logado - usar o método atual
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { planType }
        });

        if (error) {
          console.error('Erro ao criar checkout:', error);
          throw error;
        }
        checkoutData = data;
      } else {
        // Usuário não logado - checkout direto
        const response = await fetch(`https://hagweqrpbrjbtsbbscbn.supabase.co/functions/v1/create-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ3dlcXJwYnJqYnRzYmJzY2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4Nzc3MzYsImV4cCI6MjA2NDQ1MzczNn0.Vv3lWCvfqTPFwCTDWsqLiMgnybseNYsbhWRft4CkRZs',
          },
          body: JSON.stringify({ planType, guestCheckout: true })
        });

        if (!response.ok) {
          throw new Error('Erro ao criar checkout');
        }
        
        checkoutData = await response.json();
      }

      if (checkoutData?.url) {
        // Abrir checkout do Stripe em nova aba
        window.open(checkoutData.url, '_blank');
      } else {
        throw new Error('URL do checkout não retornada');
      }
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Grátis",
      price: "R$ 0",
      period: "para sempre",
      description: "Perfeito para testar e começar",
      features: [
        "1 agente IA",
        "Até 30 mensagens/mês", 
        "Treinamento com PDFs",
        "Simulador de conversa",
        "Suporte básico"
      ],
      cta: "Começar grátis",
      popular: false,
      planType: "free"
    },
    {
      name: "Pro",
      price: "R$ 49",
      period: "/mês",
      description: "Ideal para pequenos negócios",
      features: [
        "3 agentes IA ativos",
        "10.000 mensagens/mês",
        "Integração WhatsApp",
        "Analytics básicos",
        "Suporte prioritário",
        "Personalizações extras"
      ],
      cta: "Escolher Pro",
      popular: true,
      planType: "pro"
    },
    {
      name: "Ultra",
      price: "R$ 99",
      period: "/mês", 
      description: "Para negócios em crescimento",
      features: [
        "Agentes IA ilimitados",
        "Mensagens ilimitadas",
        "Analytics avançados",
        "Múltiplas integrações",
        "Suporte VIP",
        "API personalizada",
        "Exportação para Telegram"
      ],
      cta: "Escolher Ultra",
      popular: false,
      planType: "ultra"
    }
  ];

  return (
    <section id="planos" className="py-12 md:py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 md:mb-16 animate-in fade-in-50 duration-500">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-lg md:text-xl text-brand-gray max-w-2xl mx-auto px-4">
            Comece grátis e escale conforme seu negócio cresce. Sem contratos longos ou pegadinhas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl p-6 md:p-8 transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-4 ${
                plan.popular 
                  ? 'bg-brand-green text-white shadow-2xl md:scale-105' 
                  : 'bg-white border-2 border-gray-200 shadow-lg hover:border-brand-green/50'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-brand-green px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6 md:mb-8">
                <h3 className={`text-xl md:text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-brand-dark'}`}>
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className={`text-3xl md:text-4xl font-bold ${plan.popular ? 'text-white' : 'text-brand-dark'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-base md:text-lg ${plan.popular ? 'text-white/80' : 'text-brand-gray'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm md:text-base ${plan.popular ? 'text-white/80' : 'text-brand-gray'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li 
                    key={featureIndex} 
                    className="flex items-start animate-in slide-in-from-left-1 duration-200"
                    style={{ animationDelay: `${(index * 200) + (featureIndex * 50)}ms` }}
                  >
                    <Check className={`h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 mt-0.5 ${plan.popular ? 'text-white' : 'text-brand-green'} flex-shrink-0`} />
                    <span className={`text-sm md:text-base ${plan.popular ? 'text-white' : 'text-brand-gray'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-2 md:py-3 transition-all duration-200 hover:scale-105 text-sm md:text-base ${
                  plan.popular 
                    ? 'bg-white text-brand-green hover:bg-gray-100' 
                    : 'bg-brand-green text-white hover:bg-brand-green/90'
                }`}
                size="lg"
                onClick={() => handleSubscribe(plan.planType)}
                disabled={loading === plan.planType}
              >
                {loading === plan.planType ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  plan.cta
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12 animate-in fade-in-50 duration-500 delay-800 px-4">
          <p className="text-brand-gray mb-4 text-sm md:text-base">
            Todos os planos incluem garantia de 7 dias. Cancele quando quiser.
          </p>
          <p className="text-xs md:text-sm text-brand-gray">
            <strong>Em breve:</strong> Integração com Instagram e Telegram
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
