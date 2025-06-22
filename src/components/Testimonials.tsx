
import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import TestimonialsLoading from './TestimonialsLoading';

const testimonials = [
  {
    id: 1,
    image: "/lovable-uploads/0ffd057c-839c-471f-aaf5-c5ae8e964207.png",
    alt: "Conversa WhatsApp com Manuel",
    description: "Cliente impressionado com o ZapAgent e fazendo vendas mesmo dormindo"
  },
  {
    id: 2,
    image: "/lovable-uploads/06325286-8456-4fc7-a18f-a7eed0626138.png",
    alt: "Conversa WhatsApp com ZapAgent",
    description: "Cliente satisfeito com o atendimento e serviço do ZapAgent"
  }
];

const Testimonials = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for testimonials
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <TestimonialsLoading />;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 transition-all duration-700 hover:text-primary">
            Resultados Reais dos Nossos Clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-500 hover:text-gray-800">
            Veja como o ZapAgent está transformando negócios através do WhatsApp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative animate-scale-in hover-lift transition-all duration-500"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                {/* iPhone-style frame */}
                <div className="bg-gray-900 rounded-t-2xl px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-white text-xs font-medium">WhatsApp</div>
                  </div>
                </div>
                
                {/* Screenshot com tamanho fixo */}
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.alt}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay with subtle gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Floating badge */}
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                  ✓ Verificado
                </div>
              </div>
              
              {/* Description */}
              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm font-medium group-hover:text-gray-800 transition-colors duration-300">
                  {testimonial.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional social proof elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center animate-fade-in">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <p className="text-gray-600">Taxa de Satisfação</p>
          </div>
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-gray-600">Disponibilidade</p>
          </div>
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-3xl font-bold text-purple-600 mb-2">+10k</div>
            <p className="text-gray-600">Empresas Atendidas</p>
          </div>
        </div>

        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center bg-white rounded-full px-8 py-4 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:bg-gray-50 group">
            <div className="flex items-center mr-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-6 w-6 text-yellow-400 fill-current transition-transform duration-300 hover:scale-125" 
                  />
                ))}
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-primary">4.9/5.0</span>
            </div>
            <div className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">
              Baseado em <span className="font-semibold">2.847 avaliações</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
