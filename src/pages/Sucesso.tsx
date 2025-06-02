
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Sucesso = () => {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Verificar assinatura no Stripe
        const { data, error } = await supabase.functions.invoke('verify-subscription');
        
        if (error) {
          console.error('Erro ao verificar assinatura:', error);
          toast.error('Erro ao verificar pagamento');
        } else {
          setVerified(true);
          if (data?.subscribed) {
            toast.success(`Pagamento confirmado! Plano ${data.plan_type} ativado com sucesso.`);
          }
        }
      } catch (error) {
        console.error('Erro na verificação:', error);
        toast.error('Erro ao verificar pagamento');
      } finally {
        setLoading(false);
      }
    };

    // Aguardar um pouco para o Stripe processar
    const timer = setTimeout(verifyPayment, 2000);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Verificando Pagamento
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto confirmamos sua assinatura...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              Agora você tem acesso a todos os recursos do seu novo plano.
            </p>
            <p className="text-sm text-gray-500">
              Você pode gerenciar sua assinatura a qualquer momento no painel.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Ir para Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sucesso;
