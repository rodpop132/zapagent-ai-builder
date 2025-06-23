
import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
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
  },
  {
    id: 3,
    image: "/lovable-uploads/4cf374ef-e694-40da-8de0-968ef3817ae5.png",
    alt: "Conversa WhatsApp com Fernando - ZapAgent",
    description: "Fernando celebra 5 vendas em uma manhã com ZapAgent funcionando automaticamente"
  }
];

const Testimonials = () => {
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    // Simulate loading time for testimonials
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (!loading && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 1) % testimonials.length
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [loading, isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % testimonials.length
    );
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  if (loading) {
    return <TestimonialsLoading />;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-primary mr-4"></div>
            <Quote className="h-8 w-8 text-primary" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-primary ml-4"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 transition-all duration-700 hover:text-primary">
            Resultados Reais dos Nossos Clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed transition-all duration-500 hover:text-gray-800">
            Veja como o ZapAgent está transformando negócios através do WhatsApp com resultados comprovados e vendas automáticas
          </p>
        </div>

        {/* Carrossel de Testimonials */}
        <div 
          className="relative max-w-lg mx-auto mb-20"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Container do carrossel com sombra premium */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white transform hover:scale-[1.02] transition-all duration-500">
            {/* iPhone-style frame melhorado */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between relative">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <div className="text-white text-sm font-semibold tracking-wide flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                WhatsApp
              </div>
              <div className="w-16"></div>
              {/* Linha decorativa */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
            </div>
            
            {/* Container das imagens melhorado */}
            <div className="relative h-[650px] overflow-hidden bg-gradient-to-b from-gray-50 to-white">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                    index === currentIndex 
                      ? 'translate-x-0 opacity-100 scale-100' 
                      : index < currentIndex 
                        ? '-translate-x-full opacity-0 scale-95'
                        : 'translate-x-full opacity-0 scale-95'
                  }`}
                >
                  <img
                    src={testimonial.image}
                    alt={testimonial.alt}
                    className="w-full h-full object-contain p-4"
                  />
                  
                  {/* Overlay gradient sutil melhorado */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
                  
                  {/* Efeitos de luz */}
                  <div className="absolute top-4 left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-4 right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                </div>
              ))}
              
              {/* Badge flutuante melhorado */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-bounce flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                ✓ Verificado
              </div>
            </div>
          </div>

          {/* Controles de navegação melhorados */}
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-x-1 z-10 border border-gray-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:translate-x-1 z-10 border border-gray-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicadores de posição melhorados */}
          <div className="flex justify-center mt-8 space-x-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative transition-all duration-500 ${
                  index === currentIndex 
                    ? 'w-12 h-3 bg-primary scale-110 shadow-lg shadow-primary/30' 
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-110'
                } rounded-full`}
              >
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Descrição do testimonio atual melhorada */}
          <div className="text-center mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <p className="text-gray-700 text-lg font-medium transition-all duration-500 leading-relaxed">
              {testimonials[currentIndex].description}
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-5 w-5 text-yellow-400 fill-current transition-all duration-300 hover:scale-125" 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional social proof elements melhorados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center animate-fade-in bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-3">98%</div>
            <p className="text-gray-600 font-medium">Taxa de Satisfação</p>
          </div>
          <div className="text-center animate-fade-in bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-3">24/7</div>
            <p className="text-gray-600 font-medium">Disponibilidade</p>
          </div>
          <div className="text-center animate-fade-in bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100" style={{ animationDelay: '0.4s' }}>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mb-3">+10k</div>
            <p className="text-gray-600 font-medium">Empresas Atendidas</p>
          </div>
        </div>

        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-2xl px-10 py-6 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 hover:bg-white group border border-gray-100">
            <div className="flex items-center mr-8">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-7 w-7 text-yellow-400 fill-current transition-transform duration-300 hover:scale-125 mr-1" 
                  />
                ))}
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent transition-all duration-300">4.9/5.0</span>
            </div>
            <div className="text-gray-600 transition-colors duration-300 group-hover:text-gray-800">
              Baseado em <span className="font-bold text-primary">2.847 avaliações</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
