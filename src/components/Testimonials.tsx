
import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import TestimonialsLoading from './TestimonialsLoading';

const testimonials = [
  {
    name: "Maria Silva",
    role: "E-commerce Manager",
    company: "Loja Virtual SP",
    rating: 5,
    text: "O ZapAgent AI revolucionou nosso atendimento! Conseguimos responder 10x mais clientes com a mesma qualidade.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "João Santos",
    role: "Proprietário",
    company: "Restaurante Sabor & Arte",
    rating: 5,
    text: "Desde que implementamos o assistente, nossos pedidos aumentaram 40%. O sistema é incrível!",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ana Costa",
    role: "Diretora de Marketing",
    company: "Clínica Vida Saudável",
    rating: 5,
    text: "A automação do agendamento nos permitiu focar no que realmente importa: cuidar dos nossos pacientes.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Carlos Oliveira",
    role: "CEO",
    company: "Tech Solutions",
    rating: 5,
    text: "ROI impressionante! O investimento se pagou em menos de 2 meses. Recomendo para qualquer negócio.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Luciana Ferreira",
    role: "Gerente de Vendas",
    company: "Moda & Estilo",
    rating: 5,
    text: "Nossos clientes adoram a rapidez nas respostas. O atendimento ficou disponível 24/7 sem custos extras.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Rafael Lima",
    role: "Fundador",
    company: "Fitness Pro",
    rating: 5,
    text: "A integração foi super simples e os resultados apareceram na primeira semana. Fantástico!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais de 10.000 empresas já transformaram seu atendimento com o ZapAgent AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary opacity-20" />
                <p className="text-gray-700 leading-relaxed pl-4">
                  "{testimonial.text}"
                </p>
              </div>

              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-primary font-medium">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 animate-fade-in">
          <div className="inline-flex items-center bg-white rounded-full px-8 py-4 shadow-lg">
            <div className="flex items-center mr-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">4.9/5.0</span>
            </div>
            <div className="text-sm text-gray-600">
              Baseado em <span className="font-semibold">2.847 avaliações</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
