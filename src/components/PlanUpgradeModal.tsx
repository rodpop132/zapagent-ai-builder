
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Infinity } from 'lucide-react';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

const PlanUpgradeModal = ({ isOpen, onClose, currentPlan }: PlanUpgradeModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: '€29',
      period: '/mês',
      description: 'Ideal para pequenas empresas',
      messages: '10.000',
      agents: 'Até 5 agentes',
      support: 'Suporte prioritário',
      icon: Crown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        '10.000 mensagens por mês',
        'Até 5 agentes IA',
        'Suporte prioritário',
        'Análise de conversas',
        'Integração avançada'
      ]
    },
    {
      id: 'ultra',
      name: 'Ultra',
      price: '€79',
      period: '/mês',
      description: 'Para empresas em crescimento',
      messages: 'Ilimitadas',
      agents: 'Agentes ilimitados',
      support: 'Suporte 24/7',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Mensagens ilimitadas',
        'Agentes ilimitados',
        'Suporte 24/7',
        'API personalizada',
        'Relatórios avançados',
        'Integração WhatsApp Business'
      ]
    }
  ];

  const handleUpgrade = (planId: string) => {
    console.log(`Upgrading to ${planId} plan`);
    // Aqui você implementaria a integração com Stripe
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Atualize seu Plano
          </DialogTitle>
          <p className="text-center text-gray-600">
            Escolha o plano ideal para suas necessidades
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => {
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
                      {plan.messages} mensagens
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
                  >
                    {isSelected ? 'Escolher este Plano' : 'Selecionar'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Todos os planos incluem 7 dias de teste gratuito</p>
          <p>Cancele a qualquer momento, sem taxas ocultas</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeModal;
