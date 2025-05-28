
const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Criar",
      description: "Configure seu agente em minutos, sem código. Defina nome, personalidade e área de atuação.",
      icon: "🎯"
    },
    {
      number: "02", 
      title: "Treinar",
      description: "Carregue PDFs, digite perguntas frequentes ou cole textos. Sua IA aprende sobre seu negócio.",
      icon: "🧠"
    },
    {
      number: "03",
      title: "Ativar no WhatsApp",
      description: "Conecte com WhatsApp e comece a atender clientes automaticamente 24 horas por dia.",
      icon: "💬"
    }
  ];

  return (
    <section id="como-funciona" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Como funciona o ZapAgent AI
          </h2>
          <p className="text-xl text-brand-gray max-w-2xl mx-auto">
            Em apenas 3 etapas simples, você terá um agente inteligente respondendo seus clientes automaticamente
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-green/20 transition-colors">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm font-bold text-brand-green tracking-wider">
                    ETAPA {step.number}
                  </span>
                  <h3 className="text-2xl font-bold text-brand-dark mt-2">
                    {step.title}
                  </h3>
                </div>
                
                <p className="text-brand-gray leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-brand-green/30 transform -translate-y-1/2 z-10">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-brand-green rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
