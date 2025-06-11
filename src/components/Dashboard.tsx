import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import PlanUpgradeModal from "@/components/PlanUpgradeModal";
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [newMessageCount, setNewMessageCount] = useState(1247);
  const [clientCount, setClientCount] = useState(156);
  const [responseRate, setResponseRate] = useState(94);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const conversations = [
    { name: t('dashboard.conversations.joao.name'), message: t('dashboard.conversations.joao.message'), time: "2 min", status: "online" },
    { name: t('dashboard.conversations.maria.name'), message: t('dashboard.conversations.maria.message'), time: "5 min", status: "typing" },
    { name: t('dashboard.conversations.pedro.name'), message: t('dashboard.conversations.pedro.message'), time: "8 min", status: "read" },
    { name: t('dashboard.conversations.ana.name'), message: t('dashboard.conversations.ana.message'), time: "12 min", status: "online" },
    { name: "Carlos Mendes", message: "Prazo de entrega para SP?", time: "15 min", status: "delivered" },
    { name: "Lucia Ferreira", message: "Aceita cartão de crédito?", time: "18 min", status: "online" },
    { name: "Roberto Silva", message: "Tem desconto para atacado?", time: "20 min", status: "typing" },
    { name: "Fernanda Lima", message: "Como funciona a garantia?", time: "22 min", status: "online" },
    { name: "Marcos Oliveira", message: "Fazem instalação?", time: "25 min", status: "read" }
  ];

  // Simular novas conversas chegando e estatísticas atualizando
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentConversationIndex((prev) => (prev + 1) % conversations.length);
      
      // Simular crescimento das estatísticas
      const shouldUpdate = Math.random() > 0.7; // 30% chance de atualizar
      if (shouldUpdate) {
        setNewMessageCount(prev => prev + Math.floor(Math.random() * 3) + 1);
        
        if (Math.random() > 0.8) { // 20% chance de novo cliente
          setClientCount(prev => prev + 1);
        }
        
        if (Math.random() > 0.9) { // 10% chance de taxa de resposta mudar
          setResponseRate(prev => Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1)));
        }
      }
    }, 2000); // Troca a cada 2 segundos para mais dinamismo

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
      case 'online': return t('dashboard.status.online');
      case 'typing': return t('dashboard.status.typing');
      case 'read': return t('dashboard.status.read');
      case 'delivered': return t('dashboard.status.delivered');
      default: return t('dashboard.status.offline');
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
            {t('dashboard.title')}
          </h2>
          <p className="text-lg md:text-xl text-brand-gray max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-200 px-4">
            {t('dashboard.subtitle')}
          </p>
          
          {/* Upgrade Plan Button */}
          <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700 delay-400">
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-r from-brand-green to-green-600 hover:from-brand-green/90 hover:to-green-600/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Crown className="h-5 w-5 mr-2" />
              {t('dashboard.upgradePlan')}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 max-w-4xl mx-auto hover:shadow-3xl transition-all duration-500 animate-in scale-in-95 duration-700 delay-300 group">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-brand-green/10 rounded-lg p-4 md:p-6 text-center hover:bg-brand-green/15 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in slide-in-from-left-6 duration-500 delay-500 group relative overflow-hidden">
              <div className="text-2xl md:text-3xl font-bold text-brand-green mb-2 group-hover:scale-110 transition-transform duration-300 animate-glow">
                {newMessageCount.toLocaleString()}
              </div>
              <div className="text-brand-gray text-sm md:text-base">{t('dashboard.messagesSent')}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 md:p-6 text-center hover:bg-blue-100 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in slide-in-from-bottom-6 duration-500 delay-700 group">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">{responseRate}%</div>
              <div className="text-brand-gray text-sm md:text-base">{t('dashboard.responseRate')}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 md:p-6 text-center hover:bg-purple-100 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in slide-in-from-right-6 duration-500 delay-900 group relative overflow-hidden">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">{clientCount}</div>
              <div className="text-brand-gray text-sm md:text-base">{t('dashboard.clientsServed')}</div>
              {/* New client indicator */}
              {clientCount % 10 === 0 && (
                <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                  +1
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 md:p-6 hover:bg-gray-100 transition-colors duration-300 animate-in fade-in-50 duration-700 delay-1100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-dark animate-in slide-in-from-left-4 duration-500 delay-1200 text-lg md:text-xl">
                {t('dashboard.recentConversations')}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-brand-gray">{t('dashboard.live')}</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-hidden">
              {conversations.slice(0, 4).map((conversation, index) => {
                const isActive = index === currentConversationIndex % 4;
                const isNewMessage = index === 0 && currentConversationIndex % conversations.length === 0;
                return (
                  <div 
                    key={`${conversation.name}-${index}-${currentConversationIndex}`}
                    className={`flex items-center justify-between bg-white p-3 rounded-lg transition-all duration-500 cursor-pointer group relative ${
                      isActive ? 'ring-2 ring-brand-green shadow-lg scale-102' : 'hover:shadow-md hover:scale-102'
                    } ${isNewMessage ? 'border-l-4 border-green-500' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`relative w-8 h-8 md:w-10 md:h-10 bg-brand-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                        isActive ? 'animate-bounce' : ''
                      }`}>
                        <span className="text-white font-bold text-xs md:text-sm">
                          {conversation.name.charAt(0)}
                        </span>
                        {/* Status indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(conversation.status)} rounded-full border-2 border-white`}></div>
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
                    {/* New message indicator */}
                    {isNewMessage && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-bounce">
                        !
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nova conversa chegando indicator - mais dinâmico */}
            <div className="mt-4 p-3 bg-gradient-to-r from-brand-green/10 to-blue-500/10 rounded-lg border border-brand-green/20 animate-slide-in-bottom">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-brand-green rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-brand-dark">
                      {Math.floor(Math.random() * 3) + 1} {t('dashboard.newMessages')}
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-brand-green h-2 rounded-full animate-pulse" style={{width: `${Math.random() * 100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Upgrade */}
      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan="free"
      />
    </section>
  );
};

export default Dashboard;
