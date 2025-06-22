
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

        {/* Carrossel de Testimonials */}
        <div 
          className="relative max-w-2xl mx-auto mb-16"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Container do carrossel */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
            {/* iPhone-style frame */}
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-white text-sm font-medium">WhatsApp</div>
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>
            
            {/* Container das imagens */}
            <div className="relative h-[600px] overflow-hidden">
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
                    className="w-full h-full object-contain bg-white"
                  />
                  
                  {/* Overlay gradient sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                </div>
              ))}
              
              {/* Floating badge */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                ✓ Verificado
              </div>
            </div>
          </div>

          {/* Controles de navegação */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicadores de posição */}
          <div className="flex justify-center mt-6 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125 shadow-lg' 
                    : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                }`}
              />
            ))}
          </div>
          
          {/* Descrição do testimonio atual */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-lg font-medium transition-all duration-500">
              {testimonials[currentIndex].description}
            </p>
          </div>
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
