
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, RefreshCw, Clock, User, Bot, TrendingUp } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';
import { MessagesPersistenceService } from '@/services/messagesPersistenceService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AgentHistoryProps {
  phoneNumber: string;
  agentName: string;
  subscription: any;
}

interface ConversationItem {
  id?: string;
  user_message?: string;
  bot_response?: string;
  message?: string;
  response?: string;
  timestamp?: string;
  created_at?: string;
}

const AgentHistory = ({ phoneNumber, agentName, subscription }: AgentHistoryProps) => {
  const [history, setHistory] = useState<ConversationItem[]>([]);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadAgentData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log(`📜 Carregando dados do agente ${phoneNumber}...`);
      
      // Carregar dados do banco de dados primeiro (sempre disponível)
      const [persistedConversations, persistedStats] = await Promise.all([
        MessagesPersistenceService.getAgentConversations(user.id, phoneNumber, 50),
        MessagesPersistenceService.getAgentStatistics(user.id, phoneNumber)
      ]);

      console.log('💾 Dados do banco carregados:', {
        conversations: persistedConversations.length,
        stats: persistedStats?.total_messages || 0
      });

      // Converter formato das conversas persistidas
      const persistedHistory = persistedConversations.map(conv => ({
        id: conv.id,
        user_message: conv.user_message,
        bot_response: conv.bot_response,
        message: conv.user_message,
        response: conv.bot_response,
        timestamp: conv.created_at,
        created_at: conv.created_at
      }));

      // Tentar carregar dados da API também (pode não estar disponível)
      try {
        const apiStatusData = await ZapAgentService.getAgentStatus(phoneNumber);
        console.log('🌐 Dados da API carregados:', {
          historico: apiStatusData.historico?.length || 0,
          mensagens_enviadas: apiStatusData.mensagens_enviadas || 0
        });

        // Combinar dados: priorizar dados persistidos, complementar com API se necessário
        const apiHistory = apiStatusData.historico || [];
        
        // Usar dados persistidos como base, e adicionar estatísticas da API se disponível
        setHistory(persistedHistory);
        setAgentStats({
          ...apiStatusData,
          mensagens_enviadas: persistedStats?.total_messages || apiStatusData.mensagens_enviadas || 0,
          total_messages_persisted: persistedStats?.total_messages || 0,
          last_message_persisted: persistedStats?.last_message_at
        });
      } catch (apiError) {
        console.log('⚠️ API não disponível, usando apenas dados persistidos');
        
        // Usar apenas dados do banco
        setHistory(persistedHistory);
        setAgentStats({
          numero: phoneNumber,
          conectado: false,
          mensagens_enviadas: persistedStats?.total_messages || 0,
          total_messages_persisted: persistedStats?.total_messages || 0,
          last_message_persisted: persistedStats?.last_message_at,
          ultima_mensagem: persistedConversations[0] ? {
            user: persistedConversations[0].user_message,
            bot: persistedConversations[0].bot_response,
            timestamp: persistedConversations[0].created_at
          } : null
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do agente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar alguns dados do agente. Dados locais mantidos.",
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
  }, [phoneNumber, user?.id]);

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
    const used = agentStats?.mensagens_enviadas || 0;
    const limit = getMessagesLimit();
    if (limit === '∞') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const isLimitReached = () => {
    const used = agentStats?.mensagens_enviadas || 0;
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
                {agentStats?.mensagens_enviadas || 0} / {getMessagesLimit()}
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
            
            {agentStats?.total_messages_persisted && (
              <p className="text-xs text-green-600">
                💾 {agentStats.total_messages_persisted} mensagens salvas permanentemente
              </p>
            )}
            
            {isLimitReached() && (
              <p className="text-xs text-red-600">
                ⚠️ Limite de mensagens atingido. Atualize seu plano para continuar.
              </p>
            )}
          </div>

          {/* Última Mensagem */}
          {agentStats?.ultima_mensagem && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Última Interação</h4>
              {agentStats.ultima_mensagem.user && (
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Cliente:</strong> {agentStats.ultima_mensagem.user}
                </p>
              )}
              {agentStats.ultima_mensagem.bot && (
                <p className="text-xs text-gray-600 mb-1">
                  <strong>{agentName}:</strong> {agentStats.ultima_mensagem.bot}
                </p>
              )}
              {agentStats.ultima_mensagem.timestamp && (
                <p className="text-xs text-gray-500">
                  {formatTimestamp(agentStats.ultima_mensagem.timestamp)}
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
            {history.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {history.length} conversas
              </Badge>
            )}
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
                <div key={chat.id || index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    {/* Mensagem do usuário */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Cliente</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {chat.user_message || chat.message}
                        </p>
                      </div>
                    </div>

                    {/* Resposta do bot */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-green">{agentName}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {chat.bot_response || chat.response}
                        </p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(chat.created_at || chat.timestamp || '')}
                      </div>
                      {chat.id && (
                        <Badge variant="outline" className="text-xs">
                          💾 Salvo
                        </Badge>
                      )}
                    </div>
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
