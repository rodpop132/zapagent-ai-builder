
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, Star } from 'lucide-react';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

const PlanUpgradeModal = ({ isOpen, onClose, currentPlan }: PlanUpgradeModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 49',
      period: '/mês',
      description: 'Ideal para pequenos negócios',
      icon: <Crown className="h-6 w-6" />,
      color: 'bg-blue-500',
      features: [
        '1 agente IA ativo',
        '1.000 mensagens/mês',
        'Integração WhatsApp',
        'Analytics básicos',
        'Suporte prioritário',
        'Personalizações extras'
      ],
      popular: false
    },
    {
      id: 'ultra',
      name: 'Ultra',
      price: 'R$ 99',
      period: '/mês',
      description: 'Para negócios em crescimento',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-purple-500',
      features: [
        '3 agentes IA ativos',
        'Mensagens ilimitadas',
        'Analytics avançados',
        'Múltiplas integrações',
        'Suporte VIP',
        'API personalizada',
        'Exportação para Telegram'
      ],
      popular: true
    }
  ];

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    setSelectedPlan(planId);
    
    try {
      // Aqui será implementada a integração com Stripe
      console.log('Upgrading to plan:', planId);
      // Simular redirecionamento para Stripe
      setTimeout(() => {
        alert(`Redirecionando para checkout do plano ${planId.toUpperCase()}...`);
        setLoading(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <span>Atualize seu Plano</span>
          </DialogTitle>
          <DialogDescription>
            Escolha o plano ideal para expandir seu negócio com mais recursos e funcionalidades
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {plans.map((plan, index) => (
            <div 
              key={plan.id} 
              className={`relative rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 animate-in fade-in-50 ${
                plan.popular 
                  ? 'border-brand-green bg-brand-green/5 shadow-lg' 
                  : 'border-gray-200 hover:border-brand-green/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-green text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${plan.color} text-white mb-3`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-brand-dark">
                    {plan.price}
                  </span>
                  <span className="text-lg text-brand-gray">
                    {plan.period}
                  </span>
                </div>
                <p className="text-brand-gray">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li 
                    key={featureIndex} 
                    className="flex items-center animate-in slide-in-from-left-1 duration-200"
                    style={{ animationDelay: `${(index * 100) + (featureIndex * 50)}ms` }}
                  >
                    <Check className="h-5 w-5 mr-3 text-brand-green flex-shrink-0" />
                    <span className="text-brand-gray text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading || currentPlan === plan.id}
                className={`w-full py-3 transition-all duration-200 hover:scale-105 ${
                  plan.popular 
                    ? 'bg-brand-green text-white hover:bg-brand-green/90' 
                    : 'bg-gray-100 text-brand-dark hover:bg-brand-green hover:text-white'
                } ${currentPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                size="lg"
              >
                {loading && selectedPlan === plan.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </div>
                ) : currentPlan === plan.id ? (
                  'Plano Atual'
                ) : (
                  `Escolher ${plan.name}`
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-6 animate-in fade-in-50 duration-300 delay-500">
          <p className="text-brand-gray mb-2">
            Todos os planos incluem garantia de 7 dias. Cancele quando quiser.
          </p>
          <p className="text-sm text-brand-gray">
            Processamento seguro via Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeModal;
