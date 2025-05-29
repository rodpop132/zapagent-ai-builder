
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
    <section id="como-funciona" className="py-20 px-4 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-24 h-24 bg-brand-green/5 rounded-full animate-bounce delay-300"></div>
      <div className="absolute bottom-10 left-10 w-20 h-20 bg-blue-500/5 rounded-full animate-bounce delay-700"></div>
      
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-in fade-in-50 duration-700">
          <h2 className="text-4xl font-bold text-brand-dark mb-4 animate-in slide-in-from-top-6 duration-700">
            Como funciona o ZapAgent AI
          </h2>
          <p className="text-xl text-brand-gray max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-300">
            Em apenas 3 etapas simples, você terá um agente inteligente respondendo seus clientes automaticamente
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative group animate-in slide-in-from-bottom-8 duration-700 hover:scale-105 transition-all"
              style={{ animationDelay: `${500 + (index * 200)}ms` }}
            >
              <div className="text-center group-hover:transform group-hover:-translate-y-2 transition-all duration-500">
                <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-green/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-pulse">
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{step.icon}</span>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm font-bold text-brand-green tracking-wider group-hover:text-brand-green/80 transition-colors duration-300">
                    ETAPA {step.number}
                  </span>
                  <h3 className="text-2xl font-bold text-brand-dark mt-2 group-hover:text-brand-green transition-colors duration-300">
                    {step.title}
                  </h3>
                </div>
                
                <p className="text-brand-gray leading-relaxed group-hover:text-brand-dark transition-colors duration-300">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-brand-green/30 transform -translate-y-1/2 z-10 group-hover:bg-brand-green/60 transition-colors duration-300">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                </div>
              )}
              
              {/* Hover shadow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg -z-10"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
