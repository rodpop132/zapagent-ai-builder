
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingSection = () => {
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
      popular: false
    },
    {
      name: "Pro",
      price: "R$ 49",
      period: "/mês",
      description: "Ideal para pequenos negócios",
      features: [
        "1 agente IA ativo",
        "1.000 mensagens/mês",
        "Integração WhatsApp",
        "Analytics básicos",
        "Suporte prioritário",
        "Personalizações extras"
      ],
      cta: "Escolher Pro",
      popular: true
    },
    {
      name: "Ultra",
      price: "R$ 99",
      period: "/mês", 
      description: "Para negócios em crescimento",
      features: [
        "3 agentes IA ativos",
        "Mensagens ilimitadas",
        "Analytics avançados",
        "Múltiplas integrações",
        "Suporte VIP",
        "API personalizada",
        "Exportação para Telegram"
      ],
      cta: "Escolher Ultra",
      popular: false
    }
  ];

  return (
    <section id="planos" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-in fade-in-50 duration-500">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-xl text-brand-gray max-w-2xl mx-auto">
            Comece grátis e escale conforme seu negócio cresce. Sem contratos longos ou pegadinhas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-4 ${
                plan.popular 
                  ? 'bg-brand-green text-white shadow-2xl scale-105' 
                  : 'bg-white border-2 border-gray-200 shadow-lg hover:border-brand-green/50'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-pulse">
                  <span className="bg-white text-brand-green px-4 py-2 rounded-full text-sm font-bold">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-brand-dark'}`}>
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-brand-dark'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${plan.popular ? 'text-white/80' : 'text-brand-gray'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`${plan.popular ? 'text-white/80' : 'text-brand-gray'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li 
                    key={featureIndex} 
                    className="flex items-center animate-in slide-in-from-left-1 duration-200"
                    style={{ animationDelay: `${(index * 200) + (featureIndex * 50)}ms` }}
                  >
                    <Check className={`h-5 w-5 mr-3 ${plan.popular ? 'text-white' : 'text-brand-green'} flex-shrink-0`} />
                    <span className={`${plan.popular ? 'text-white' : 'text-brand-gray'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-3 transition-all duration-200 hover:scale-105 ${
                  plan.popular 
                    ? 'bg-white text-brand-green hover:bg-gray-100' 
                    : 'bg-brand-green text-white hover:bg-brand-green/90'
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 animate-in fade-in-50 duration-500 delay-800">
          <p className="text-brand-gray mb-4">
            Todos os planos incluem garantia de 7 dias. Cancele quando quiser.
          </p>
          <p className="text-sm text-brand-gray">
            <strong>Em breve:</strong> Integração com Instagram e Telegram
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
