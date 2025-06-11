import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Infinity, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

const PlanUpgradeModal = ({ isOpen, onClose, currentPlan }: PlanUpgradeModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { i18n } = useTranslation();

  // Detectar país baseado no idioma
  const getCountryFromLanguage = () => {
    switch (i18n.language) {
      case 'pt': return 'brasil';
      case 'es': return 'spain';
      case 'en': 
      default: return 'usa';
    }
  };

  const allPlans = [
    {
      id: 'pro',
      name: 'Pro',
      price: i18n.language === 'pt' ? 'R$ 79' : i18n.language === 'es' ? '€ 12' : '$ 15',
      period: i18n.language === 'pt' ? '/mês' : i18n.language === 'es' ? '/mes' : '/month',
      description: i18n.language === 'pt' ? 'Ideal para pequenas empresas' : i18n.language === 'es' ? 'Ideal para pequeñas empresas' : 'Ideal for small businesses',
      messages: i18n.language === 'pt' ? '10.000' : '10,000',
      agents: i18n.language === 'pt' ? 'Até 3 agentes' : i18n.language === 'es' ? 'Hasta 3 agentes' : 'Up to 3 agents',
      support: i18n.language === 'pt' ? 'Suporte prioritário' : i18n.language === 'es' ? 'Soporte prioritario' : 'Priority support',
      icon: Crown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: i18n.language === 'pt' ? [
        '10.000 mensagens por mês',
        'Até 3 agentes IA',
        'Suporte prioritário',
        'Análise de conversas',
        'Integração avançada'
      ] : i18n.language === 'es' ? [
        '10.000 mensajes por mes',
        'Hasta 3 agentes IA',
        'Soporte prioritario',
        'Análisis de conversaciones',
        'Integración avanzada'
      ] : [
        '10,000 messages per month',
        'Up to 3 AI agents',
        'Priority support',
        'Conversation analysis',
        'Advanced integration'
      ]
    },
    {
      id: 'ultra',
      name: 'Ultra',
      price: i18n.language === 'pt' ? 'R$ 179' : i18n.language === 'es' ? '€ 28' : '$ 37',
      period: i18n.language === 'pt' ? '/mês' : i18n.language === 'es' ? '/mes' : '/month',
      description: i18n.language === 'pt' ? 'Para empresas em crescimento' : i18n.language === 'es' ? 'Para empresas en crecimiento' : 'For growing businesses',
      messages: i18n.language === 'pt' ? 'Ilimitadas' : i18n.language === 'es' ? 'Ilimitados' : 'Unlimited',
      agents: i18n.language === 'pt' ? 'Agentes ilimitados' : i18n.language === 'es' ? 'Agentes ilimitados' : 'Unlimited agents',
      support: i18n.language === 'pt' ? 'Suporte 24/7' : i18n.language === 'es' ? 'Soporte 24/7' : '24/7 support',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: i18n.language === 'pt' ? [
        'Mensagens ilimitadas',
        'Agentes ilimitados',
        'Suporte 24/7',
        'API personalizada',
        'Relatórios avançados',
        'Integração WhatsApp Business'
      ] : i18n.language === 'es' ? [
        'Mensajes ilimitados',
        'Agentes ilimitados',
        'Soporte 24/7',
        'API personalizada',
        'Informes avanzados',
        'Integración WhatsApp Business'
      ] : [
        'Unlimited messages',
        'Unlimited agents',
        '24/7 support',
        'Custom API',
        'Advanced reports',
        'WhatsApp Business integration'
      ]
    }
  ];

  // Filtrar planos baseado no plano atual
  const availablePlans = allPlans.filter(plan => {
    if (currentPlan === 'free') {
      return plan.id === 'pro' || plan.id === 'ultra';
    } else if (currentPlan === 'pro') {
      return plan.id === 'ultra';
    }
    return false; // Se já tem ultra, não mostra nenhum plano
  });

  // Se já tem plano ultra, não permitir upgrade
  if (currentPlan === 'ultra') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {i18n.language === 'pt' ? 'Plano Máximo Atingido' : i18n.language === 'es' ? 'Plan Máximo Alcanzado' : 'Maximum Plan Reached'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Zap className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              {i18n.language === 'pt' ? 'Você já possui o plano Ultra, nosso plano mais completo!' : 
               i18n.language === 'es' ? '¡Ya tienes el plan Ultra, nuestro plan más completo!' :
               'You already have the Ultra plan, our most complete plan!'}
            </p>
            <Button onClick={onClose} className="bg-brand-green hover:bg-brand-green/90">
              {i18n.language === 'pt' ? 'Fechar' : i18n.language === 'es' ? 'Cerrar' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Se não há planos disponíveis, não mostrar modal
  if (availablePlans.length === 0) {
    return null;
  }

  // Definir plano selecionado inicial baseado no disponível
  useState(() => {
    if (availablePlans.length > 0) {
      setSelectedPlan(availablePlans[0].id);
    }
  });

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast.error(i18n.language === 'pt' ? 'Você precisa estar logado para assinar um plano' : 
                  i18n.language === 'es' ? 'Necesitas estar conectado para suscribirte a un plan' :
                  'You need to be logged in to subscribe to a plan');
      return;
    }

    setLoading(true);
    
    try {
      const country = getCountryFromLanguage();
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType: planId,
          country: country
        }
      });

      if (error) {
        console.error('Erro ao criar checkout:', error);
        throw error;
      }

      if (data?.url) {
        // Abrir checkout do Stripe em nova aba
        window.open(data.url, '_blank');
        onClose();
      } else {
        throw new Error('URL do checkout não retornada');
      }
    } catch (error) {
      console.error('Erro ao processar upgrade:', error);
      toast.error(i18n.language === 'pt' ? 'Erro ao processar pagamento. Tente novamente.' :
                  i18n.language === 'es' ? 'Error al procesar el pago. Inténtalo de nuevo.' :
                  'Error processing payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    if (currentPlan === 'free') {
      return i18n.language === 'pt' ? 'Atualize seu Plano' : 
             i18n.language === 'es' ? 'Actualiza tu Plan' : 
             'Upgrade your Plan';
    } else if (currentPlan === 'pro') {
      return i18n.language === 'pt' ? 'Upgrade para Ultra' : 
             i18n.language === 'es' ? 'Upgrade a Ultra' : 
             'Upgrade to Ultra';
    }
    return i18n.language === 'pt' ? 'Atualize seu Plano' : 
           i18n.language === 'es' ? 'Actualiza tu Plan' : 
           'Upgrade your Plan';
  };

  const getModalDescription = () => {
    if (currentPlan === 'pro') {
      return i18n.language === 'pt' ? 'Desbloqueie recursos ilimitados com o plano Ultra' :
             i18n.language === 'es' ? 'Desbloquea recursos ilimitados con el plan Ultra' :
             'Unlock unlimited resources with the Ultra plan';
    }
    return i18n.language === 'pt' ? 'Escolha o plano ideal para suas necessidades' :
           i18n.language === 'es' ? 'Elige el plan ideal para tus necesidades' :
           'Choose the ideal plan for your needs';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {getModalTitle()}
          </DialogTitle>
          <p className="text-center text-gray-600">
            {getModalDescription()}
          </p>
        </DialogHeader>

        <div className={`grid grid-cols-1 ${availablePlans.length > 1 ? 'md:grid-cols-2' : ''} gap-6 mt-6 ${availablePlans.length === 1 ? 'max-w-md mx-auto' : ''}`}>
          {availablePlans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected ? `ring-2 ring-offset-2 ${plan.borderColor.replace('border-', 'ring-')}` : ''
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 ${plan.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-6 w-6 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Badge variant="secondary" className="text-xs">
                      {plan.messages} {i18n.language === 'pt' ? 'mensagens' : i18n.language === 'es' ? 'mensajes' : 'messages'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {plan.agents}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}

                  <Button
                    className={`w-full mt-6 ${
                      isSelected 
                        ? 'bg-brand-green hover:bg-brand-green/90' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {i18n.language === 'pt' ? 'Processando...' : 
                         i18n.language === 'es' ? 'Procesando...' : 
                         'Processing...'}
                      </>
                    ) : (
                      isSelected ? 
                        (i18n.language === 'pt' ? 'Escolher este Plano' : 
                         i18n.language === 'es' ? 'Elegir este Plan' : 
                         'Choose this Plan') : 
                        (i18n.language === 'pt' ? 'Selecionar' : 
                         i18n.language === 'es' ? 'Seleccionar' : 
                         'Select')
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            {i18n.language === 'pt' ? 'Todos os planos incluem 7 dias de teste gratuito' :
             i18n.language === 'es' ? 'Todos los planes incluyen 7 días de prueba gratuita' :
             'All plans include 7 days free trial'}
          </p>
          <p>
            {i18n.language === 'pt' ? 'Cancele a qualquer momento, sem taxas ocultas' :
             i18n.language === 'es' ? 'Cancela en cualquier momento, sin tarifas ocultas' :
             'Cancel anytime, no hidden fees'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeModal;
