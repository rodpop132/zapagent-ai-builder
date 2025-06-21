
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';
import { useAuth } from '@/hooks/useAuth';

interface MessagesUsageCardProps {
  phoneNumber: string;
  agentName: string;
  subscription: any;
  onLimitReached?: () => void;
}

const MessagesUsageCard = ({ phoneNumber, agentName, subscription, onLimitReached }: MessagesUsageCardProps) => {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const getMessagesLimit = (planType: string) => {
    switch (planType) {
      case 'free': return 30;
      case 'pro': return 10000;
      case 'ultra': return 999999;
      case 'unlimited': return 999999;
      default: return 30;
    }
  };

  const loadUsageData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('📊 Carregando dados de uso para:', { phoneNumber, userId: user.id });
      
      const data = await ZapAgentService.getMessagesUsed(user.id, phoneNumber);
      console.log('✅ Dados de uso carregados:', data);
      
      setUsageData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Erro ao carregar dados de uso:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsageData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadUsageData, 30000);
    return () => clearInterval(interval);
  }, [phoneNumber, user?.id]);

  if (!usageData) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-4">
            <RefreshCw className={`h-6 w-6 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="ml-2 text-gray-500">
              {loading ? 'Carregando dados...' : 'Dados não disponíveis'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const planType = subscription?.plan_type || usageData.plano || 'free';
  const messagesUsed = usageData.mensagensUsadas || 0;
  const messagesLimit = subscription?.is_unlimited ? '∞' : getMessagesLimit(planType);
  const activeAgents = usageData.agentesAtivos || 0;
  const isLimitReached = messagesLimit !== '∞' && messagesUsed >= messagesLimit;
  const isNearLimit = messagesLimit !== '∞' && messagesUsed >= (messagesLimit * 0.8);

  // Chamar callback se limite atingido
  useEffect(() => {
    if (isLimitReached && onLimitReached) {
      onLimitReached();
    }
  }, [isLimitReached, onLimitReached]);

  const getUsagePercentage = () => {
    if (messagesLimit === '∞') return 0;
    return Math.min((messagesUsed / messagesLimit) * 100, 100);
  };

  const getPlanDisplayName = (plan: string) => {
    const names: Record<string, string> = {
      'free': 'Gratuito',
      'gratuito': 'Gratuito',
      'pro': 'Pro',
      'ultra': 'Ultra',
      'unlimited': 'Ilimitado'
    };
    return names[plan] || 'Gratuito';
  };

  return (
    <div className="space-y-4">
      {/* Card principal de uso */}
      <Card className={`border-l-4 ${isLimitReached ? 'border-l-red-500' : isNearLimit ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              Uso de Mensagens - {agentName}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={isLimitReached ? "destructive" : "default"}>
                {getPlanDisplayName(planType)}
              </Badge>
              <button
                onClick={loadUsageData}
                disabled={loading}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Contador principal */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Mensagens Utilizadas</span>
              <span className={`text-lg font-bold ${isLimitReached ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                {messagesUsed} / {messagesLimit}
              </span>
            </div>
            
            {messagesLimit !== '∞' && (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isLimitReached ? 'bg-red-500' : 
                    isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{width: `${getUsagePercentage()}%`}}
                ></div>
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeAgents}</div>
              <div className="text-xs text-gray-500">Agentes Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {messagesLimit === '∞' ? '∞' : Math.max(0, messagesLimit - messagesUsed)}
              </div>
              <div className="text-xs text-gray-500">Mensagens Restantes</div>
            </div>
          </div>

          {/* Última atualização */}
          <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-50">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {isLimitReached && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Limite atingido!</strong> Você usou todas as {messagesLimit} mensagens do plano {getPlanDisplayName(planType)}. 
            O agente não conseguirá responder novas mensagens até que você atualize seu plano.
          </AlertDescription>
        </Alert>
      )}

      {isNearLimit && !isLimitReached && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <TrendingUp className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Atenção!</strong> Você está próximo do limite. Usou {messagesUsed} de {messagesLimit} mensagens disponíveis no plano {getPlanDisplayName(planType)}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MessagesUsageCard;
