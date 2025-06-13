
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cancelado = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Pagamento Cancelado
          </CardTitle>
          <CardDescription className="text-lg">
            Sua assinatura não foi processada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Não se preocupe! Você pode tentar novamente a qualquer momento.
            </p>
            <p className="text-sm text-gray-500">
              Seus dados não foram perdidos e você continua com o plano atual.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cancelado;
