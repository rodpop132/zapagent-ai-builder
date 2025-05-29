
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
    <section className="bg-gradient-to-br from-white to-gray-50 py-20 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark leading-tight mb-6 animate-in slide-in-from-left-8 duration-700">
              Crie seu agente com IA e{" "}
              <span className="text-brand-green animate-in slide-in-from-bottom-4 duration-1000 delay-300 inline-block">atenda seus clientes</span>{" "}
              automaticamente
            </h1>
            
            <p className="text-xl text-brand-gray mb-8 leading-relaxed animate-in fade-in-50 duration-700 delay-500">
              Transforme o seu atendimento com inteligência artificial. 
              <strong className="text-brand-dark"> Você cria de graça. Só paga quando começar a usar no WhatsApp.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in slide-in-from-bottom-6 duration-700 delay-700">
              <Button 
                size="lg" 
                onClick={handleCreateAgent}
                className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-brand-green/25 transform group"
              >
                Criar agente grátis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleSimulateConversation}
                className="border-brand-green text-brand-green hover:bg-brand-green/10 px-8 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Simular conversa
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-brand-gray animate-in fade-in-50 duration-700 delay-1000">
              <div className="flex items-center group hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-brand-green rounded-full mr-2 animate-pulse"></div>
                Criação gratuita
              </div>
              <div className="flex items-center group hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-brand-green rounded-full mr-2 animate-pulse delay-150"></div>
                Sem código necessário
              </div>
              <div className="flex items-center group hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-brand-green rounded-full mr-2 animate-pulse delay-300"></div>
                24h por dia
              </div>
            </div>
          </div>
          
          <div className="relative animate-in slide-in-from-right-8 duration-700 delay-300">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
              <div className="bg-gray-100 rounded-lg p-4 mb-4 group-hover:bg-gray-50 transition-colors duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center mr-3 animate-pulse">
                    <span className="text-white font-bold">AI</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-dark">Agente IA</p>
                    <p className="text-xs text-brand-gray flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      online agora
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-left-4 delay-1000">
                    <p className="text-sm text-brand-gray">Cliente:</p>
                    <p className="text-brand-dark">Olá, vocês fazem entrega?</p>
                  </div>
                  <div className="bg-brand-green/10 p-3 rounded-lg hover:bg-brand-green/15 transition-all duration-300 animate-in slide-in-from-right-4 delay-1200">
                    <p className="text-sm text-brand-gray">Agente IA:</p>
                    <p className="text-brand-dark">Sim! Fazemos entregas em toda a cidade. O prazo é de 2-4 horas e a taxa é R$ 5,00. Gostaria de fazer um pedido?</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-brand-gray">
                Seu agente responde automaticamente 24/7
              </p>
            </div>
            
            {/* Floating elements for extra animation */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-brand-green/20 rounded-full animate-bounce delay-700"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500/20 rounded-full animate-bounce delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
