
import { Check } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: "🤖",
      title: "Atendimento automático 24/7",
      description: "Seu agente nunca para de trabalhar. Responde clientes a qualquer hora, mesmo quando você está dormindo."
    },
    {
      icon: "🧠",
      title: "IA treinada no seu negócio", 
      description: "Carregue seus próprios dados e treine a IA para responder exatamente como você responderia."
    },
    {
      icon: "📱",
      title: "Integração direta com WhatsApp",
      description: "Conecta direto com WhatsApp Business ou Web WhatsApp. Seus clientes nem vão perceber que é um robô."
    },
    {
      icon: "📊",
      title: "Analytics completos",
      description: "Veja quantas mensagens foram enviadas, taxa de resposta e performance do seu agente."
    },
    {
      icon: "⚡",
      title: "Fácil de usar - sem código",
      description: "Interface intuitiva que qualquer pessoa consegue usar. Não precisa ser programador."
    },
    {
      icon: "💰",
      title: "Comece grátis",
      description: "Crie e teste seu agente sem pagar nada. Só paga quando quiser usar no WhatsApp."
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Por que escolher o ZapAgent AI?
          </h2>
          <p className="text-xl text-brand-gray max-w-2xl mx-auto">
            Ideal para pequenos negócios, freelancers e e-commerces que querem automatizar o atendimento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="group hover:shadow-lg transition-shadow p-6 rounded-lg border border-gray-100">
              <div className="w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-green/20 transition-colors">
                <span className="text-2xl">{benefit.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-brand-dark mb-3">
                {benefit.title}
              </h3>
              
              <p className="text-brand-gray leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-brand-green/5 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-brand-dark mb-4">
            Transforme o seu atendimento com inteligência artificial
          </h3>
          <p className="text-brand-gray mb-6 max-w-2xl mx-auto">
            Junte-se a centenas de negócios que já automatizaram seu atendimento e aumentaram suas vendas
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Check className="h-5 w-5 text-brand-green" />
            <span className="text-brand-dark font-medium">Cancele quando quiser, sem burocracia</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
