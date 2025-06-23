
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentConversationIndex((prev) => (prev + 1) % conversations.length);
      
      const shouldUpdate = Math.random() > 0.7;
      if (shouldUpdate) {
        setNewMessageCount(prev => prev + Math.floor(Math.random() * 3) + 1);
        
        if (Math.random() > 0.8) {
          setClientCount(prev => prev + 1);
        }
        
        if (Math.random() > 0.9) {
          setResponseRate(prev => Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1)));
        }
      }
    }, 3000);

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

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUpgradeModal(true);
  };

  return (
    <section id="dashboard-demo" className="py-8 md:py-20 px-4 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="absolute top-20 left-10 w-12 h-12 md:w-20 md:h-20 bg-brand-green/5 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-10 h-10 md:w-16 md:h-16 bg-blue-500/5 rounded-full animate-pulse delay-100"></div>
      
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-brand-dark mb-4">
            {t('dashboard.title')}
          </h2>
          <p className="text-base md:text-xl text-brand-gray max-w-2xl mx-auto mb-6 px-4">
            {t('dashboard.subtitle')}
          </p>
          
          <div className="flex justify-center">
            <Button
              onClick={handleUpgradeClick}
              className="w-full max-w-xs bg-gradient-to-r from-brand-green to-green-600 hover:from-brand-green/90 hover:to-green-600/90 text-white px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation"
              type="button"
            >
              <Crown className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="truncate">{t('dashboard.upgradePlan')}</span>
            </Button>
          </div>
        </div>

        {/* Estatísticas Mobile Otimizadas */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-brand-green/10 rounded-lg p-3 md:p-6 text-center hover:bg-brand-green/15 transition-all duration-300">
            <div className="text-lg md:text-3xl font-bold text-brand-green mb-1 md:mb-2">
              {newMessageCount.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs md:text-base text-brand-gray leading-tight">
              {t('dashboard.messagesSent')}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 md:p-6 text-center hover:bg-blue-100 transition-all duration-300">
            <div className="text-lg md:text-3xl font-bold text-blue-600 mb-1 md:mb-2">
              {responseRate}%
            </div>
            <div className="text-xs md:text-base text-brand-gray leading-tight">
              {t('dashboard.responseRate')}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 md:p-6 text-center hover:bg-purple-100 transition-all duration-300 relative">
            <div className="text-lg md:text-3xl font-bold text-purple-600 mb-1 md:mb-2">
              {clientCount}
            </div>
            <div className="text-xs md:text-base text-brand-gray leading-tight">
              {t('dashboard.clientsServed')}
            </div>
            {clientCount % 10 === 0 && (
              <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-bounce">
                +1
              </div>
            )}
          </div>
        </div>

        {/* Lista de Conversas Mobile Otimizada */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6 hover:bg-gray-100 transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h3 className="font-bold text-brand-dark text-lg md:text-xl mb-2 md:mb-0">
              {t('dashboard.recentConversations')}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-brand-gray">{t('dashboard.live')}</span>
            </div>
          </div>

          <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
            {conversations.slice(0, 4).map((conversation, index) => {
              const isActive = index === currentConversationIndex % 4;
              const isNewMessage = index === 0 && currentConversationIndex % conversations.length === 0;
              
              return (
                <div 
                  key={`${conversation.name}-${index}`}
                  className={`flex items-center justify-between bg-white p-3 md:p-4 rounded-lg transition-all duration-300 touch-manipulation ${
                    isActive ? 'ring-2 ring-brand-green shadow-lg scale-[1.02]' : 'hover:shadow-md hover:scale-[1.01]'
                  } ${isNewMessage ? 'border-l-4 border-green-500' : ''}`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`relative w-10 h-10 md:w-12 md:h-12 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'animate-pulse' : ''
                    }`}>
                      <span className="text-white font-bold text-sm md:text-base">
                        {conversation.name.charAt(0)}
                      </span>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(conversation.status)} rounded-full border-2 border-white`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-brand-dark text-sm md:text-base truncate ${
                        isActive ? 'text-brand-green' : ''
                      }`}>
                        {conversation.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-brand-gray text-xs md:text-sm truncate max-w-[140px] md:max-w-[200px]">
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
                  
                  <div className="flex flex-col items-end space-y-1 ml-3 flex-shrink-0">
                    <span className="text-xs text-brand-gray">
                      {conversation.time}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(conversation.status)}`}>
                      {getStatusText(conversation.status)}
                    </span>
                  </div>
                  
                  {isNewMessage && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                      !
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Novas mensagens chegando */}
          <div className="mt-4 p-3 bg-gradient-to-r from-brand-green/10 to-blue-500/10 rounded-lg border border-brand-green/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-brand-green rounded-full animate-pulse flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-brand-dark">
                    {Math.floor(Math.random() * 3) + 1} {t('dashboard.newMessages')}
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-brand-green h-2 rounded-full animate-pulse" style={{width: `${Math.random() * 100}%`}}></div>
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
