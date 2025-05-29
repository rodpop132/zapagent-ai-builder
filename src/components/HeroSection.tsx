
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleCreateAgent = () => {
    navigate('/auth');
  };

  const handleSimulateConversation = () => {
    const dashboardSection = document.getElementById('dashboard-demo');
    if (dashboardSection) {
      dashboardSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 py-12 md:py-20 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-dark leading-tight mb-4 md:mb-6 animate-in slide-in-from-left-8 duration-700">
              Crie seu agente com IA e{" "}
              <span className="text-brand-green animate-in slide-in-from-bottom-4 duration-1000 delay-300 inline-block">atenda seus clientes</span>{" "}
              automaticamente
            </h1>
            
            <p className="text-lg md:text-xl text-brand-gray mb-6 md:mb-8 leading-relaxed animate-in fade-in-50 duration-700 delay-500 px-4 lg:px-0">
              Transforme o seu atendimento com inteligência artificial. 
              <strong className="text-brand-dark block mt-2"> Você cria de graça. Só paga quando começar a usar no WhatsApp.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start animate-in slide-in-from-bottom-6 duration-700 delay-700 px-4 lg:px-0">
              <Button 
                size="lg" 
                onClick={handleCreateAgent}
                className="bg-brand-green hover:bg-brand-green/90 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-green/25 transform group w-full sm:w-auto"
              >
                Criar agente grátis
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleSimulateConversation}
                className="border-brand-green text-brand-green hover:bg-brand-green/10 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group w-full sm:w-auto"
              >
                <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform duration-300" />
                Simular conversa
              </Button>
            </div>
            
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-brand-gray animate-in fade-in-50 duration-700 delay-1000">
              <div className="flex items-center group hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-brand-green rounded-full mr-2"></div>
                Criação gratuita
              </div>
              <div className="flex items-center group hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-brand-green rounded-full mr-2"></div>
                Sem código necessário
              </div>
              <div className="flex items-center group hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-brand-green rounded-full mr-2"></div>
                24h por dia
              </div>
            </div>
          </div>
          
          <div className="relative animate-in slide-in-from-right-8 duration-700 delay-300 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-md mx-auto hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
              <div className="bg-gray-100 rounded-lg p-3 md:p-4 mb-3 md:mb-4 group-hover:bg-gray-50 transition-colors duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-green rounded-full flex items-center justify-center mr-2 md:mr-3">
                    <span className="text-white font-bold text-xs md:text-sm">AI</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-dark text-sm md:text-base">Agente IA</p>
                    <p className="text-xs text-brand-gray flex items-center">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full mr-1"></span>
                      online agora
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-left-4 delay-1000">
                    <p className="text-xs md:text-sm text-brand-gray">Cliente:</p>
                    <p className="text-brand-dark text-sm md:text-base">Olá, vocês fazem entrega?</p>
                  </div>
                  <div className="bg-brand-green/10 p-2 md:p-3 rounded-lg hover:bg-brand-green/15 transition-all duration-300 animate-in slide-in-from-right-4 delay-1200">
                    <p className="text-xs md:text-sm text-brand-gray">Agente IA:</p>
                    <p className="text-brand-dark text-sm md:text-base">Sim! Fazemos entregas em toda a cidade. O prazo é de 2-4 horas e a taxa é R$ 5,00. Gostaria de fazer um pedido?</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-brand-gray">
                Seu agente responde automaticamente 24/7
              </p>
            </div>
            
            {/* Floating elements for extra animation */}
            <div className="absolute -top-2 md:-top-4 -right-2 md:-right-4 w-6 h-6 md:w-8 md:h-8 bg-brand-green/20 rounded-full animate-bounce delay-700"></div>
            <div className="absolute -bottom-2 md:-bottom-4 -left-2 md:-left-4 w-4 h-4 md:w-6 md:h-6 bg-blue-500/20 rounded-full animate-bounce delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
