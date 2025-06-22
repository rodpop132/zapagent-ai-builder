import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Crown, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SupportNotification {
  id: string;
  message: string;
  type: 'support' | 'upgrade' | 'tip';
  icon: React.ReactNode;
}

const SupportNotifications = () => {
  const { t } = useTranslation();
  const [currentNotification, setCurrentNotification] = useState<SupportNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const notifications: SupportNotification[] = [
    {
      id: '1',
      message: 'Olá! Como está sendo sua experiência com o ZapAgent? Gostaria de compartilhar algum feedback?',
      type: 'support',
      icon: <MessageCircle className="h-5 w-5 text-blue-600" />
    },
    {
      id: '2',
      message: 'Já pensou em fazer upgrade para nosso plano Pro? Você teria 10.000 mensagens mensais!',
      type: 'upgrade',
      icon: <Crown className="h-5 w-5 text-purple-600" />
    },
    {
      id: '3',
      message: 'Dica: Você pode personalizar ainda mais seu agente no painel de edição. Já experimentou?',
      type: 'tip',
      icon: <Sparkles className="h-5 w-5 text-green-600" />
    },
    {
      id: '4',
      message: 'Nossa equipe está aqui para ajudar! Tem alguma dúvida sobre como usar a plataforma?',
      type: 'support',
      icon: <MessageCircle className="h-5 w-5 text-blue-600" />
    },
    {
      id: '5',
      message: 'Com o plano Ultra você tem mensagens ilimitadas! Que tal experimentar por 7 dias grátis?',
      type: 'upgrade',
      icon: <Crown className="h-5 w-5 text-purple-600" />
    },
    {
      id: '6',
      message: 'Você sabia que pode ver o histórico completo de conversas do seu agente? Confira nas configurações!',
      type: 'tip',
      icon: <Sparkles className="h-5 w-5 text-green-600" />
    },
    {
      id: '7',
      message: 'Como está o desempenho do seu agente? Precisa de ajuda para otimizar as respostas?',
      type: 'support',
      icon: <MessageCircle className="h-5 w-5 text-blue-600" />
    },
    {
      id: '8',
      message: 'Hora de crescer! Com mais agentes você pode atender diferentes tipos de cliente. Vamos conversar?',
      type: 'upgrade',
      icon: <Crown className="h-5 w-5 text-purple-600" />
    },
    {
      id: '9',
      message: 'Dica profissional: Personalize as saudações do seu agente para criar mais conexão com os clientes!',
      type: 'tip',
      icon: <Sparkles className="h-5 w-5 text-green-600" />
    },
    {
      id: '10',
      message: 'Tudo funcionando bem por aí? Se precisar de suporte, estamos sempre prontos para ajudar! 😊',
      type: 'support',
      icon: <MessageCircle className="h-5 w-5 text-blue-600" />
    }
  ];

  useEffect(() => {
    const checkForNotification = () => {
      const lastNotificationTime = localStorage.getItem('lastSupportNotification');
      const now = Date.now();
      const threeHours = 3 * 60 * 60 * 1000; // 3 horas em milissegundos

      if (!lastNotificationTime || now - parseInt(lastNotificationTime) >= threeHours) {
        // Mostrar notificação aleatória
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        setCurrentNotification(randomNotification);
        setIsVisible(true);
        localStorage.setItem('lastSupportNotification', now.toString());
      }
    };

    // Verificar imediatamente e depois a cada minuto
    checkForNotification();
    const interval = setInterval(checkForNotification, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setCurrentNotification(null), 600);
  };

  const handleAction = () => {
    if (currentNotification?.type === 'upgrade') {
      // Aqui você pode adicionar lógica para abrir modal de upgrade
      console.log('Abrir modal de upgrade');
    } else if (currentNotification?.type === 'support') {
      // Abrir widget de suporte
      window.open('mailto:suporte@zapagent.ai', '_blank');
    }
    handleClose();
  };

  const getActionText = () => {
    switch (currentNotification?.type) {
      case 'upgrade':
        return 'Ver Planos';
      case 'support':
        return 'Falar Conosco';
      case 'tip':
        return 'Entendi';
      default:
        return 'OK';
    }
  };

  const getCardColor = () => {
    switch (currentNotification?.type) {
      case 'upgrade':
        return 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100';
      case 'support':
        return 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100';
      case 'tip':
        return 'border-green-200 bg-gradient-to-br from-green-50 to-green-100';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  if (!currentNotification || !isVisible) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          0% {
            transform: translateX(100%) translateY(20px) scale(0.9);
            opacity: 0;
          }
          60% {
            transform: translateX(-8px) translateY(0) scale(1.02);
            opacity: 0.9;
          }
          100% {
            transform: translateX(0) translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          0% {
            transform: translateX(0) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(100%) translateY(-10px) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
      <div 
        className={`fixed bottom-4 right-4 z-40 max-w-sm transition-all duration-700 ease-out transform ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100 translate-x-0' 
            : 'opacity-0 translate-y-8 scale-90 translate-x-4 pointer-events-none'
        }`}
        style={{
          animation: isVisible 
            ? 'slideInRight 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards, bounceIn 0.3s ease-out 0.4s' 
            : 'slideOutRight 0.6s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards'
        }}
      >
        <Card className={`shadow-2xl ${getCardColor()} border-2 backdrop-blur-md hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group`}>
          <CardContent className="p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
            
            <div className="flex items-start space-x-3 relative z-10">
              <div className="flex-shrink-0 mt-1 relative">
                <div className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                  {currentNotification.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-relaxed font-medium transition-colors duration-300 group-hover:text-gray-900">
                  {currentNotification.message}
                </p>
                <div className="flex items-center justify-between mt-3 space-x-2">
                  <Button
                    onClick={handleAction}
                    size="sm"
                    className="text-xs px-4 py-2 h-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {getActionText()}
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    size="sm"
                    className="text-xs px-3 py-2 h-8 text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-all duration-300"
                  >
                    Mais tarde
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 p-1.5 h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupportNotifications;
