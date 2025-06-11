
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t('faq.questions.q1.question'),
      answer: t('faq.questions.q1.answer')
    },
    {
      question: t('faq.questions.q2.question'),
      answer: t('faq.questions.q2.answer')
    },
    {
      question: t('faq.questions.q3.question'),
      answer: t('faq.questions.q3.answer')
    },
    {
      question: t('faq.questions.q4.question'),
      answer: t('faq.questions.q4.answer')
    },
    {
      question: t('faq.questions.q5.question'),
      answer: t('faq.questions.q5.answer')
    },
    {
      question: t('faq.questions.q6.question'),
      answer: t('faq.questions.q6.answer')
    },
    {
      question: t('faq.questions.q7.question'),
      answer: t('faq.questions.q7.answer')
    },
    {
      question: t('faq.questions.q8.question'),
      answer: t('faq.questions.q8.answer')
    }
  ];

  return (
    <section id="faq" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-xl text-brand-gray">
            {t('faq.subtitle')}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white rounded-lg border border-gray-200 px-6"
            >
              <AccordionTrigger className="text-left text-brand-dark hover:text-brand-green">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-brand-gray leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-brand-gray mb-4">
            {t('faq.contactText')}
          </p>
          <a 
            href="mailto:suporte@zapagent.ai" 
            className="text-brand-green hover:text-brand-green/80 font-medium"
          >
            {t('faq.contactLink')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
