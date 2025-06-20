import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, RefreshCw, Clock, User, Bot, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AgentHistoryProps {
  phoneNumber: string;
  agentName: string;
  subscription: any;
  onMessageUpdate?: () => void;
}

interface AgentMessage {
  id: string;
  numero: string;
  pergunta: string;
  resposta: string;
  created_at: string;
}

const AgentHistory = ({ phoneNumber, agentName, subscription, onMessageUpdate }: AgentHistoryProps) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadMessages = async () => {
    setLoading(true);
    try {
      console.log(`📜 Carregando mensagens para o número ${phoneNumber}...`);
      
      // Buscar agente pelo número de telefone
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('phone_number', cleanNumber)
        .single();

      if (agentError || !agent) {
        console.error('❌ Agente não encontrado:', agentError);
        return;
      }

      // Buscar mensagens do agente
      const { data: messagesData, error: messagesError } = await supabase
        .from('agent_messages')
        .select('*')
        .eq('agent_id', agent.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (messagesError) {
        console.error('❌ Erro ao buscar mensagens:', messagesError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens",
          variant: "destructive"
        });
        return;
      }

      // Contar total de mensagens
      const { count, error: countError } = await supabase
        .from('agent_messages')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id);

      if (countError) {
        console.error('❌ Erro ao contar mensagens:', countError);
      }

      setMessages(messagesData || []);
      setTotalMessages(count || 0);
      
      // Notificar componente pai sobre atualização
      if (onMessageUpdate) {
        onMessageUpdate();
      }
      
      console.log(`✅ ${messagesData?.length || 0} mensagens carregadas, total: ${count || 0}`);
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadMessages, 30000);
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
    const used = totalMessages;
    const limit = getMessagesLimit();
    if (limit === '∞') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const isLimitReached = () => {
    const used = totalMessages;
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
              onClick={loadMessages}
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
              <span className="text-sm font-medium">Total de Mensagens Recebidas</span>
              <Badge variant={isLimitReached() ? "destructive" : "default"}>
                {totalMessages} / {getMessagesLimit()}
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
          {messages.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Última Interação</h4>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Cliente ({messages[0].numero}):</strong> {messages[0].pergunta}
              </p>
              <p className="text-xs text-gray-600 mb-1">
                <strong>{agentName}:</strong> {messages[0].resposta}
              </p>
              <p className="text-xs text-gray-500">
                {formatTimestamp(messages[0].created_at)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Conversas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-brand-green" />
            Últimas Perguntas e Respostas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin text-brand-green mx-auto mb-2" />
              <p className="text-sm text-gray-600">Carregando mensagens...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma mensagem registrada ainda</p>
              <p className="text-sm text-gray-500 mt-1">
                As mensagens aparecerão aqui quando o bot começar a responder
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    {/* Pergunta do usuário */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Cliente ({message.numero})</p>
                        <p className="text-sm text-gray-700 mt-1">{message.pergunta}</p>
                      </div>
                    </div>

                    {/* Resposta do bot */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-green">{agentName}</p>
                        <p className="text-sm text-gray-700 mt-1">{message.resposta}</p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(message.created_at)}
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
