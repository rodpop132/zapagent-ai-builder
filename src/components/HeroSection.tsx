
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleCreateAgent = () => {
    navigate('/auth');
  };

  const handleSimulateConversation = () => {
    // Scroll to the dashboard demo section
    const dashboardSection = document.getElementById('dashboard-demo');
    if (dashboardSection) {
      dashboardSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark leading-tight mb-6">
              Crie seu agente com IA e{" "}
              <span className="text-brand-green">atenda seus clientes</span>{" "}
              automaticamente
            </h1>
            
            <p className="text-xl text-brand-gray mb-8 leading-relaxed">
              Transforme o seu atendimento com inteligência artificial. 
              <strong className="text-brand-dark"> Você cria de graça. Só paga quando começar a usar no WhatsApp.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={handleCreateAgent}
                className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                Criar agente grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleSimulateConversation}
                className="border-brand-green text-brand-green hover:bg-brand-green/10 px-8 py-4 text-lg transition-all duration-200 hover:scale-105"
              >
                <Play className="mr-2 h-5 w-5" />
                Simular conversa
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-brand-gray">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-brand-green rounded-full mr-2"></div>
                Criação gratuita
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-brand-green rounded-full mr-2"></div>
                Sem código necessário
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-brand-green rounded-full mr-2"></div>
                24h por dia
              </div>
            </div>
          </div>
          
          <div className="relative animate-scale-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">AI</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-dark">Agente IA</p>
                    <p className="text-xs text-brand-gray">online agora</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-brand-gray">Cliente:</p>
                    <p className="text-brand-dark">Olá, vocês fazem entrega?</p>
                  </div>
                  <div className="bg-brand-green/10 p-3 rounded-lg">
                    <p className="text-sm text-brand-gray">Agente IA:</p>
                    <p className="text-brand-dark">Sim! Fazemos entregas em toda a cidade. O prazo é de 2-4 horas e a taxa é R$ 5,00. Gostaria de fazer um pedido?</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-brand-gray">
                Seu agente responde automaticamente 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
