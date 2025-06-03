
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, RefreshCw, Clock, User, Bot, TrendingUp } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';
import { useToast } from '@/hooks/use-toast';

interface AgentHistoryProps {
  phoneNumber: string;
  agentName: string;
  subscription: any;
}

const AgentHistory = ({ phoneNumber, agentName, subscription }: AgentHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAgentData = async () => {
    setLoading(true);
    try {
      console.log(`📜 Carregando dados do agente ${phoneNumber}...`);
      
      const statusData = await ZapAgentService.getAgentStatus(phoneNumber);
      setAgentStatus(statusData);
      setHistory(statusData.historico || []);
      
      console.log(`✅ Dados carregados:`, {
        historico: statusData.historico?.length || 0,
        mensagens_enviadas: statusData.mensagens_enviadas || 0
      });
    } catch (error) {
      console.error('❌ Erro ao carregar dados do agente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do agente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadAgentData, 30000);
    return () => clearInterval(interval);
  }, [phoneNumber]);

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const getMessagesLimit = () => {
    const planType = subscription?.plan_type || 'free';
    switch (planType) {
      case 'free': return 30;
      case 'pro': return 10000;
      case 'ultra': return 999999;
      case 'unlimited': return '∞';
      default: return 30;
    }
  };

  const getUsagePercentage = () => {
    const used = agentStatus?.mensagens_enviadas || 0;
    const limit = getMessagesLimit();
    if (limit === '∞') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const isLimitReached = () => {
    const used = agentStatus?.mensagens_enviadas || 0;
    const limit = getMessagesLimit();
    return limit !== '∞' && used >= limit;
  };

  return (
    <div className="space-y-4">
      {/* Estatísticas do Agente */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-brand-green" />
              Estatísticas do Agente
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAgentData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contador de Mensagens */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Mensagens Enviadas</span>
              <Badge variant={isLimitReached() ? "destructive" : "default"}>
                {agentStatus?.mensagens_enviadas || 0} / {getMessagesLimit()}
              </Badge>
            </div>
            
            {getMessagesLimit() !== '∞' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isLimitReached() ? 'bg-red-500' : 
                    getUsagePercentage() > 80 ? 'bg-yellow-500' : 'bg-brand-green'
                  }`}
                  style={{width: `${getUsagePercentage()}%`}}
                ></div>
              </div>
            )}
            
            {isLimitReached() && (
              <p className="text-xs text-red-600">
                ⚠️ Limite de mensagens atingido. Atualize seu plano para continuar.
              </p>
            )}
          </div>

          {/* Última Mensagem */}
          {agentStatus?.ultima_mensagem && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Última Interação</h4>
              {agentStatus.ultima_mensagem.user && (
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Cliente:</strong> {agentStatus.ultima_mensagem.user}
                </p>
              )}
              {agentStatus.ultima_mensagem.bot && (
                <p className="text-xs text-gray-600 mb-1">
                  <strong>{agentName}:</strong> {agentStatus.ultima_mensagem.bot}
                </p>
              )}
              {agentStatus.ultima_mensagem.timestamp && (
                <p className="text-xs text-gray-500">
                  {formatTimestamp(agentStatus.ultima_mensagem.timestamp)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Conversas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-brand-green" />
            Histórico de Conversas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin text-brand-green mx-auto mb-2" />
              <p className="text-sm text-gray-600">Carregando histórico...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma conversa registrada ainda</p>
              <p className="text-sm text-gray-500 mt-1">
                As conversas aparecerão aqui quando o agente começar a responder mensagens
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history.map((chat, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    {/* Mensagem do usuário */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Cliente</p>
                        <p className="text-sm text-gray-700 mt-1">{chat.message}</p>
                      </div>
                    </div>

                    {/* Resposta do bot */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-green">{agentName}</p>
                        <p className="text-sm text-gray-700 mt-1">{chat.response}</p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    {chat.timestamp && (
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(chat.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentHistory;
