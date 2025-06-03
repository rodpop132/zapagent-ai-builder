
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Sucesso = () => {
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [verified, setVerified] = useState(false);
  const [planInfo, setPlanInfo] = useState<string>('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      console.log('💳 SUCESSO: Iniciando verificação de pagamento...');
      console.log('💳 SUCESSO: Session ID:', sessionId);

      try {
        // Aguardar um pouco para o webhook processar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('💳 SUCESSO: Verificando assinatura...');
        const { data, error } = await supabase.functions.invoke('verify-subscription');
        
        if (error) {
          console.error('❌ SUCESSO: Erro ao verificar assinatura:', error);
          toast.error('Erro ao verificar pagamento');
        } else {
          console.log('✅ SUCESSO: Resposta da verificação:', data);
          setVerified(true);
          
          if (data?.subscribed) {
            const planName = data.plan_type === 'pro' ? 'Pro' : 
                           data.plan_type === 'ultra' ? 'Ultra' : 'Premium';
            setPlanInfo(planName);
            toast.success(`Pagamento confirmado! Plano ${planName} ativado com sucesso.`);
          } else {
            console.log('⏳ SUCESSO: Aguardando processamento...');
            // Tentar novamente após alguns segundos
            setTimeout(async () => {
              console.log('🔄 SUCESSO: Verificando novamente...');
              const { data: retryData } = await supabase.functions.invoke('verify-subscription');
              if (retryData?.subscribed) {
                const planName = retryData.plan_type === 'pro' ? 'Pro' : 
                               retryData.plan_type === 'ultra' ? 'Ultra' : 'Premium';
                setPlanInfo(planName);
                toast.success(`Pagamento confirmado! Plano ${planName} ativado com sucesso.`);
              }
            }, 3000);
          }
        }
      } catch (error) {
        console.error('💥 SUCESSO: Erro na verificação:', error);
        toast.error('Erro ao verificar pagamento');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  // Countdown para redirecionamento automático
  useEffect(() => {
    if (!loading && verified) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            navigate('/auth');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, verified, navigate]);

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
            {sessionId && (
              <p className="text-xs text-gray-400 mt-2">
                ID da sessão: {sessionId.substring(0, 20)}...
              </p>
            )}
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
            ✅ Transação Realizada!
          </CardTitle>
          <CardDescription className="text-lg">
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            {planInfo && (
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-green-700 font-medium">
                  Plano {planInfo} ativado!
                </p>
              </div>
            )}
            <p className="text-gray-600">
              Agora você tem acesso a todos os recursos do seu novo plano.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                Redirecionando para o login em {countdown} segundos...
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Ir para Login
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
