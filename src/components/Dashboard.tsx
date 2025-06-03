
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  
  const conversations = [
    { name: "João Silva", message: "Qual o horário de funcionamento?", time: "2 min", status: "online" },
    { name: "Maria Santos", message: "Vocês fazem entrega no sábado?", time: "5 min", status: "typing" },
    { name: "Pedro Costa", message: "Gostaria de saber sobre os preços", time: "8 min", status: "read" },
    { name: "Ana Oliveira", message: "Produtos disponíveis hoje?", time: "12 min", status: "online" },
    { name: "Carlos Mendes", message: "Prazo de entrega para SP?", time: "15 min", status: "delivered" },
    { name: "Lucia Ferreira", message: "Aceita cartão de crédito?", time: "18 min", status: "online" }
  ];

  // Simular novas conversas chegando
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentConversationIndex((prev) => (prev + 1) % conversations.length);
    }, 3000); // Troca a cada 3 segundos

    return () => clearInterval(interval);
  }, [conversations.length]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'typing': return 'bg-yellow-500';
      case 'read': return 'bg-blue-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'typing': return 'Digitando...';
      case 'read': return 'Lida';
      case 'delivered': return 'Entregue';
      default: return 'Offline';
    }
  };

  return (
    <section id="dashboard-demo" className="py-12 md:py-20 px-4 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-12 h-12 md:w-20 md:h-20 bg-brand-green/5 rounded-full animate-float"></div>
      <div className="absolute bottom-20 right-10 w-10 h-10 md:w-16 md:h-16 bg-blue-500/5 rounded-full animate-bounce"></div>
      <div className="absolute top-1/2 left-1/4 w-8 h-8 md:w-12 md:h-12 bg-purple-500/5 rounded-full animate-pulse"></div>
      
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-12 md:mb-16 animate-in fade-in-50 duration-700">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4 animate-in slide-in-from-top-6 duration-700">
            Painel completo para gerenciar seu agente
          </h2>
          <p className="text-lg md:text-xl text-brand-gray max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-200 px-4">
            Acompanhe conversas, analytics e performance do seu agente IA em tempo real
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 max-w-4xl mx-auto hover:shadow-3xl transition-all duration-500 animate-in scale-in-95 duration-700 delay-300 group">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-brand-green/10 rounded-lg p-4 md:p-6 text-center hover:bg-brand-green/15 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in slide-in-from-left-6 duration-500 delay-500 group">
              <div className="text-2xl md:text-3xl font-bold text-brand-green mb-2 group-hover:scale-110 transition-transform duration-300 animate-glow">1.247</div>
              <div className="text-brand-gray text-sm md:text-base">Mensagens enviadas</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 md:p-6 text-center hover:bg-blue-100 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in slide-in-from-bottom-6 duration-500 delay-700 group">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">94%</div>
              <div className="text-brand-gray text-sm md:text-base">Taxa de resposta</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 md:p-6 text-center hover:bg-purple-100 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in slide-in-from-right-6 duration-500 delay-900 group">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">156</div>
              <div className="text-brand-gray text-sm md:text-base">Clientes atendidos</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 md:p-6 hover:bg-gray-100 transition-colors duration-300 animate-in fade-in-50 duration-700 delay-1100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-dark animate-in slide-in-from-left-4 duration-500 delay-1200 text-lg md:text-xl">
                Conversas recentes
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-brand-gray">Ao vivo</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-hidden">
              {conversations.slice(0, 3).map((conversation, index) => {
                const isActive = index === currentConversationIndex % 3;
                return (
                  <div 
                    key={`${conversation.name}-${index}`}
                    className={`flex items-center justify-between bg-white p-3 rounded-lg transition-all duration-500 cursor-pointer group ${
                      isActive ? 'ring-2 ring-brand-green shadow-lg scale-102 animate-pulse' : 'hover:shadow-md hover:scale-102'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`relative w-8 h-8 md:w-10 md:h-10 bg-brand-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                        isActive ? 'animate-bounce' : ''
                      }`}>
                        <span className="text-white font-bold text-xs md:text-sm">
                          {conversation.name.charAt(0)}
                        </span>
                        {/* Status indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(conversation.status)} rounded-full border-2 border-white ${
                          conversation.status === 'online' ? 'animate-pulse' : ''
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-brand-dark text-sm md:text-base group-hover:text-brand-green transition-colors duration-300 truncate ${
                          isActive ? 'text-brand-green' : ''
                        }`}>
                          {conversation.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-brand-gray text-xs md:text-sm truncate">
                            {conversation.message}
                          </p>
                          {conversation.status === 'typing' && (
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-brand-gray rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-brand-gray rounded-full animate-bounce delay-75"></div>
                              <div className="w-1 h-1 bg-brand-gray rounded-full animate-bounce delay-150"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs text-brand-gray group-hover:text-brand-dark transition-colors duration-300 flex-shrink-0">
                        {conversation.time}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(conversation.status)}`}>
                        {getStatusText(conversation.status)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nova conversa chegando indicator */}
            <div className="mt-4 p-2 bg-gradient-to-r from-brand-green/10 to-blue-500/10 rounded-lg border border-brand-green/20 animate-slide-in-bottom">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                <span className="text-xs text-brand-gray">Nova conversa aguardando...</span>
                <div className="ml-auto">
                  <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
