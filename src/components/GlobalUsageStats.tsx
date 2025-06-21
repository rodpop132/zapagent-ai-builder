
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Bot, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';
import { useAuth } from '@/hooks/useAuth';

interface GlobalUsageStatsProps {
  agents: any[];
  subscription: any;
}

const GlobalUsageStats = ({ agents, subscription }: GlobalUsageStatsProps) => {
  const { user } = useAuth();
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getMessagesLimit = (planType: string) => {
    switch (planType) {
      case 'free': return 30;
      case 'pro': return 10000;
      case 'ultra': return 999999;
      case 'unlimited': return 999999;
      default: return 30;
    }
  };

  const loadGlobalStats = async () => {
    if (!user?.id || agents.length === 0) return;
    
    setLoading(true);
    try {
      console.log('📊 Carregando estatísticas globais...');
      
      // Buscar dados de todos os agentes
      const promises = agents.map(agent => 
        ZapAgentService.getMessagesUsed(user.id, agent.phone_number)
      );
      
      const results = await Promise.all(promises);
      
      // Calcular totais
      const totalMessagesUsed = results.reduce((sum, data) => 
        sum + (data?.mensagensUsadas || 0), 0
      );
      
      const activeAgents = results.reduce((sum, data) => 
        sum + (data?.agentesAtivos || 0), 0
      );

      setGlobalStats({
        totalMessagesUsed,
        activeAgents,
        agentsCount: agents.length
      });
      
      console.log('✅ Estatísticas globais:', {
        totalMessagesUsed,
        activeAgents,
        agentsCount: agents.length
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas globais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlobalStats();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadGlobalStats, 30000);
    return () => clearInterval(interval);
  }, [agents, user?.id]);

  if (!globalStats && !loading) return null;

  const planType = subscription?.plan_type || 'free';
  const messagesLimit = subscription?.is_unlimited ? '∞' : getMessagesLimit(planType);
  const totalUsed = globalStats?.totalMessagesUsed || 0;
  const isLimitReached = messagesLimit !== '∞' && totalUsed >= messagesLimit;
  const isNearLimit = messagesLimit !== '∞' && totalUsed >= (messagesLimit * 0.8);

  const getUsagePercentage = () => {
    if (messagesLimit === '∞') return 0;
    return Math.min((totalUsed / messagesLimit) * 100, 100);
  };

  const getPlanDisplayName = (plan: string) => {
    const names: Record<string, string> = {
      'free': 'Gratuito',
      'pro': 'Pro',
      'ultra': 'Ultra',
      'unlimited': 'Ilimitado'
    };
    return names[plan] || 'Gratuito';
  };

  return (
    <div className="space-y-4">
      {/* Card de estatísticas globais */}
      <Card className={`border-l-4 ${isLimitReached ? 'border-l-red-500' : isNearLimit ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Resumo Geral de Uso
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={isLimitReached ? "destructive" : "default"}>
                {getPlanDisplayName(planType)}
              </Badge>
              <button
                onClick={loadGlobalStats}
                disabled={loading}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Carregando estatísticas...</p>
            </div>
          ) : (
            <>
              {/* Uso total de mensagens */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total de Mensagens Utilizadas</span>
                  <span className={`text-2xl font-bold ${isLimitReached ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'}`}>
                    {totalUsed} / {messagesLimit}
                  </span>
                </div>
                
                {messagesLimit !== '∞' && (
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all duration-300 ${
                        isLimitReached ? 'bg-red-500' : 
                        isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{width: `${getUsagePercentage()}%`}}
                    ></div>
                  </div>
                )}
                
                <p className="text-sm text-gray-600">
                  Uso total de mensagens de todos os seus agentes no plano {getPlanDisplayName(planType)}
                </p>
              </div>

              {/* Estatísticas dos agentes */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-green">{globalStats?.agentsCount || 0}</div>
                  <div className="text-xs text-gray-500">Total de Agentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{globalStats?.activeAgents || 0}</div>
                  <div className="text-xs text-gray-500">Agentes Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {messagesLimit === '∞' ? '∞' : Math.max(0, messagesLimit - totalUsed)}
                  </div>
                  <div className="text-xs text-gray-500">Mensagens Restantes</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Alertas globais */}
      {isLimitReached && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Limite global atingido!</strong> Você usou todas as {messagesLimit} mensagens do plano {getPlanDisplayName(planType)}. 
            Seus agentes não conseguirão responder novas mensagens até que você atualize seu plano.
          </AlertDescription>
        </Alert>
      )}

      {isNearLimit && !isLimitReached && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <TrendingUp className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Atenção!</strong> Você está próximo do limite global. 
            Usou {totalUsed} de {messagesLimit} mensagens disponíveis no plano {getPlanDisplayName(planType)}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GlobalUsageStats;
