
const Testimonials = () => {
  const testimonials = [
    {
      name: "Carlos Mendes",
      business: "Loja de Roupas Online",
      content: "O ZapAgent AI revolucionou meu atendimento! Agora consigo responder os clientes 24h e minhas vendas aumentaram 40%. Muito fácil de configurar.",
      avatar: "CM"
    },
    {
      name: "Ana Paula",
      business: "Clínica Odontológica", 
      content: "Estava perdendo muitos pacientes porque não conseguia responder as mensagens rapidamente. Com o agente IA, marco consultas automaticamente!",
      avatar: "AP"
    },
    {
      name: "Ricardo Silva", 
      business: "Delivery de Comida",
      content: "Incrível como o bot entende exatamente o que preciso. Responde sobre cardápio, preços e ainda ajuda com os pedidos. Recomendo demais!",
      avatar: "RS"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-brand-gray">
            Histórias reais de quem transformou o atendimento com IA
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
