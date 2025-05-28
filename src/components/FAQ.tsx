
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Como funciona o plano gratuito?",
      answer: "No plano gratuito você pode criar 1 agente IA e enviar até 30 mensagens por mês. Você pode treinar sua IA, usar o simulador e testar todas as funcionalidades. Para conectar com WhatsApp e enviar mais mensagens, precisa upgradar para um plano pago."
    },
    {
      question: "Preciso saber programar para usar?",
      answer: "Não! O ZapAgent AI foi criado para ser totalmente no-code. Você configura tudo através de uma interface simples e intuitiva. Basta carregar seus documentos, digitar as informações do seu negócio e pronto."
    },
    {
      question: "Como a IA aprende sobre meu negócio?",
      answer: "Você pode treinar sua IA de 3 formas: carregando arquivos PDF (como catálogos, manuais), digitando perguntas e respostas frequentes, ou colando textos livres sobre seu negócio. Quanto mais informação, melhor ela responde."
    },
    {
      question: "Funciona com WhatsApp Business?",
      answer: "Sim! Oferecemos integração tanto com WhatsApp Business API quanto com WhatsApp Web. Você escolhe a opção que melhor se adapta ao seu negócio."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Claro! Não temos contratos de fidelidade. Você pode cancelar seu plano a qualquer momento pelo painel de controle, sem burocracia."
    },
    {
      question: "Quantos clientes o agente consegue atender?",
      answer: "Seu agente IA pode conversar com múltiplos clientes simultaneamente, 24 horas por dia. O limite é apenas o número de mensagens do seu plano mensal."
    },
    {
      question: "Tem garantia?",
      answer: "Sim! Oferecemos 7 dias de garantia em todos os planos pagos. Se não ficar satisfeito, devolvemos 100% do valor."
    },
    {
      question: "Quando vem a integração com Instagram e Telegram?",
      answer: "Estamos trabalhando nas integrações com Instagram Direct e Telegram. A previsão é lançar essas funcionalidades nos próximos meses. Clientes atuais terão acesso prioritário."
    }
  ];

  return (
    <section id="faq" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-brand-gray">
            Tire suas dúvidas sobre o ZapAgent AI
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
            Ainda tem dúvidas? Estamos aqui para ajudar!
          </p>
          <a 
            href="mailto:suporte@zapagent.ai" 
            className="text-brand-green hover:text-brand-green/80 font-medium"
          >
            Entre em contato conosco
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
