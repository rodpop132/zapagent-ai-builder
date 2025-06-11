
import { Check } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Benefits = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: "🤖",
      title: t('benefits.available24h.title'),
      description: t('benefits.available24h.description')
    },
    {
      icon: "🧠",
      title: t('benefits.smartLearning.title'), 
      description: t('benefits.smartLearning.description')
    },
    {
      icon: "📱",
      title: t('benefits.whatsappIntegration.title'),
      description: t('benefits.whatsappIntegration.description')
    },
    {
      icon: "📊",
      title: t('benefits.analytics.title'),
      description: t('benefits.analytics.description')
    },
    {
      icon: "⚡",
      title: t('benefits.easySetup.title'),
      description: t('benefits.easySetup.description')
    },
    {
      icon: "💰",
      title: t('benefits.free.title'),
      description: t('benefits.free.description')
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            {t('benefits.title')}
          </h2>
          <p className="text-xl text-brand-gray max-w-2xl mx-auto">
            {t('benefits.subtitle')}
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
            {t('benefits.cta.title')}
          </h3>
          <p className="text-brand-gray mb-6 max-w-2xl mx-auto">
            {t('benefits.cta.subtitle')}
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Check className="h-5 w-5 text-brand-green" />
            <span className="text-brand-dark font-medium">{t('benefits.cta.guarantee')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
