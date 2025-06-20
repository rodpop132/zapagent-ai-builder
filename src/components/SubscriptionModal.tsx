
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  DollarSign, 
  Zap, 
  Check, 
  X,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  // Mock subscription data - replace with real data
  const subscription = {
    plan: 'Pro',
    status: 'active',
    nextBilling: '2025-01-20',
    amount: 'R$ 79,00',
    features: [
      '10.000 mensagens por mês',
      'Até 3 agentes IA',
      'Suporte prioritário',
      'Análise de conversas',
      'Integração avançada'
    ]
  };

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Para começar',
      features: ['30 mensagens', '1 agente', 'Suporte básico'],
      current: false,
      color: 'bg-gray-100 text-gray-700'
    },
    {
      name: 'Pro',
      price: 'R$ 79',
      period: '/mês',
      description: 'Ideal para pequenas empresas',
      features: ['10.000 mensagens', '3 agentes', 'Suporte prioritário'],
      current: true,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      name: 'Ultra',
      price: 'R$ 179',
      period: '/mês',
      description: 'Para empresas em crescimento',
      features: ['Mensagens ilimitadas', 'Agentes ilimitados', 'Suporte 24/7'],
      current: false,
      color: 'bg-purple-100 text-purple-700'
    }
  ];

  const handleManagePortal = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Portal do Cliente",
          description: "Abrindo portal de gerenciamento da assinatura",
          variant: "default"
        });
      } else {
        throw new Error('URL do portal não retornada');
      }
    } catch (error) {
      console.error('Erro ao abrir portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de assinatura",
        variant: "destructive"
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoadingCancel(true);
    try {
      // Implement cancellation logic here
      toast({
        title: "Cancelamento Solicitado",
        description: "Sua solicitação de cancelamento foi enviada. Entre em contato conosco se precisar de ajuda.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar o cancelamento",
        variant: "destructive"
      });
    } finally {
      setLoadingCancel(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-brand-green" />
            Gerenciar Assinatura
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Current Subscription */}
          <Card className="border-2 border-brand-green bg-gradient-to-r from-green-50 to-brand-green/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-brand-green" />
                    Plano Atual: {subscription.plan}
                  </CardTitle>
                  <CardDescription>
                    Status: <Badge className="bg-green-100 text-green-700 ml-1">
                      {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-green">{subscription.amount}</div>
                  <div className="text-sm text-gray-600">por mês</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Recursos Inclusos
                  </h4>
                  <ul className="space-y-2">
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Próxima cobrança: {subscription.nextBilling}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>Valor: {subscription.amount}/mês</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={handleManagePortal}
              disabled={loadingPortal}
              className="bg-brand-green hover:bg-brand-green/90 text-white h-12"
            >
              {loadingPortal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Portal de Cobrança
                </>
              )}
            </Button>
            <Button
              onClick={handleCancelSubscription}
              disabled={loadingCancel}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 h-12"
            >
              {loadingCancel ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar Assinatura
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Available Plans */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-green" />
              Planos Disponíveis
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card key={plan.name} className={`relative ${plan.current ? 'ring-2 ring-brand-green' : ''}`}>
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-brand-green text-white">Plano Atual</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        plan.current 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                          : 'bg-brand-green hover:bg-brand-green/90 text-white'
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? 'Plano Atual' : 'Selecionar Plano'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2 text-blue-900">Precisa de Ajuda?</h4>
              <p className="text-sm text-blue-700 mb-4">
                Nossa equipe está aqui para ajudar com qualquer dúvida sobre sua assinatura.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                  Chat de Suporte
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                  FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
