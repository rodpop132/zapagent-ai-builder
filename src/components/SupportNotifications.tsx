
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
      message: 'Já pensou em fazer upgrade para nosso plano Pro? Você teria 1000 mensagens mensais!',
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
    setTimeout(() => setCurrentNotification(null), 300);
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
        return 'border-purple-200 bg-purple-50';
      case 'support':
        return 'border-blue-200 bg-blue-50';
      case 'tip':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  if (!currentNotification || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-500">
      <Card className={`shadow-lg ${getCardColor()} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {currentNotification.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-relaxed">
                {currentNotification.message}
              </p>
              <div className="flex items-center justify-between mt-3 space-x-2">
                <Button
                  onClick={handleAction}
                  size="sm"
                  className="text-xs px-3 py-1 h-7 bg-brand-green hover:bg-brand-green/90"
                >
                  {getActionText()}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="sm"
                  className="text-xs px-2 py-1 h-7 text-gray-500 hover:text-gray-700"
                >
                  Mais tarde
                </Button>
              </div>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportNotifications;
