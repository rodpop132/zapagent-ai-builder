
import { useTranslation } from 'react-i18next';

const Testimonials = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: t('testimonials.customer1.name'),
      business: t('testimonials.customer1.business'),
      content: t('testimonials.customer1.content'),
      avatar: "CM"
    },
    {
      name: t('testimonials.customer2.name'),
      business: t('testimonials.customer2.business'), 
      content: t('testimonials.customer2.content'),
      avatar: "AP"
    },
    {
      name: t('testimonials.customer3.name'), 
      business: t('testimonials.customer3.business'),
      content: t('testimonials.customer3.content'),
      avatar: "RS"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-brand-gray">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">{testimonial.avatar}</span>
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">{testimonial.name}</h4>
                  <p className="text-sm text-brand-gray">{testimonial.business}</p>
                </div>
              </div>
              
              <p className="text-brand-gray leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
