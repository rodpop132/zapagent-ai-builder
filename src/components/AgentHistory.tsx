
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, RefreshCw, Clock, User, Bot } from 'lucide-react';
import { ZapAgentService, ChatMessage } from '@/services/zapAgentService';
import { useToast } from '@/hooks/use-toast';

interface AgentHistoryProps {
  phoneNumber: string;
  agentName: string;
}

const AgentHistory = ({ phoneNumber, agentName }: AgentHistoryProps) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadHistory = async () => {
    setLoading(true);
    try {
      const historyData = await ZapAgentService.getAgentHistory(phoneNumber);
      setHistory(historyData);
      console.log(`📜 Histórico carregado para ${phoneNumber}:`, historyData.length, 'mensagens');
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
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

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-brand-green" />
            Histórico de Conversas
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadHistory}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-2"></div>
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
  );
};

export default AgentHistory;
