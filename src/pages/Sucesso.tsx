
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFacebookTracking } from '@/hooks/useFacebookTracking';
import { useAuth } from '@/hooks/useAuth';

const Sucesso = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { trackPurchase } = useFacebookTracking();
  const { user } = useAuth();

  useEffect(() => {
    // Track purchase completion with Facebook
    const trackPurchaseEvent = async () => {
      // Try to get purchase details from URL params or estimate based on common values
      const sessionId = searchParams.get('session_id');
      const planType = searchParams.get('plan') || 'pro';
      
      // Estimate values based on plan type (you may want to store this more precisely)
      let value = 15; // Default USD price for pro
      let currency = 'USD';
      
      if (planType === 'ultra') {
        value = 37;
      }
      
      await trackPurchase(value, currency, user?.email);
    };

    trackPurchaseEvent();
  }, [searchParams, trackPurchase, user?.email]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Pagamento Confirmado!
          </CardTitle>
          <CardDescription className="text-lg">
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Parabéns! Você agora tem acesso completo a todas as funcionalidades do seu plano.
            </p>
            <p className="text-sm text-gray-500">
              Um email de confirmação foi enviado para você com todos os detalhes.
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Acessar Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sucesso;
