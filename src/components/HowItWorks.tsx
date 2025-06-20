
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: t('howItWorks.step1.number'),
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      icon: "🎯"
    },
    {
      number: t('howItWorks.step2.number'), 
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      icon: "🧠"
    },
    {
      number: t('howItWorks.step3.number'),
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      icon: "💬"
    }
  ];

  return (
    <section id="como-funciona" className="py-12 md:py-20 px-4 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-16 h-16 md:w-24 md:h-24 bg-brand-green/5 rounded-full animate-bounce delay-300 transition-all duration-700 hover:bg-brand-green/10"></div>
      <div className="absolute bottom-10 left-10 w-12 h-12 md:w-20 md:h-20 bg-blue-500/5 rounded-full animate-bounce delay-700 transition-all duration-700 hover:bg-blue-500/10"></div>
      
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 md:mb-16 animate-in fade-in-50 duration-700">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4 animate-in slide-in-from-top-6 duration-700 transition-all hover:text-primary">
            {t('howItWorks.title')}
          </h2>
          <p className="text-lg md:text-xl text-brand-gray max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-300 px-4 transition-all hover:text-brand-dark">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative group animate-in slide-in-from-bottom-8 duration-700 hover:scale-105 transition-all"
              style={{ animationDelay: `${500 + (index * 200)}ms` }}
            >
              <div className="text-center group-hover:transform group-hover:-translate-y-2 transition-all duration-500 px-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-brand-green/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 hover:shadow-lg">
                  <span className="text-2xl md:text-3xl group-hover:scale-125 transition-transform duration-300">{step.icon}</span>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm font-bold text-brand-green tracking-wider group-hover:text-brand-green/80 transition-colors duration-300">
                    ETAPA {step.number}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-brand-dark mt-2 group-hover:text-brand-green transition-colors duration-300">
                    {step.title}
                  </h3>
                </div>
                
                <p className="text-brand-gray leading-relaxed group-hover:text-brand-dark transition-colors duration-300 text-sm md:text-base">
                  {step.description}
                </p>
              </div>
              
              {/* Connector line - hidden on mobile */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 md:top-10 left-full w-6 md:w-8 h-0.5 bg-brand-green/30 transform -translate-y-1/2 z-10 group-hover:bg-brand-green/60 transition-all duration-300 hover:h-1">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-brand-green rounded-full transition-all duration-300 group-hover:scale-150"></div>
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
