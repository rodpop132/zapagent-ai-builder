
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Server, 
  Wifi, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface SystemStatus {
  api_online: boolean;
  bot_instances: number;
  connected_agents: number;
  reconnecting_agents: number;
  total_messages_today: number;
  avg_response_time: number;
  uptime_percentage: number;
  last_update: string;
}

const SystemStatusPanel = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const loadSystemStatus = async (showFeedback = false) => {
    try {
      setLoading(true);
      setError('');
      
      // Simular dados de status detalhado - substituir pela API real quando disponível
      const mockStatus: SystemStatus = {
        api_online: true,
        bot_instances: 3,
        connected_agents: Math.floor(Math.random() * 50) + 20,
        reconnecting_agents: Math.floor(Math.random() * 5),
        total_messages_today: Math.floor(Math.random() * 1000) + 500,
        avg_response_time: Math.random() * 2 + 0.5,
        uptime_percentage: 99.2 + Math.random() * 0.7,
        last_update: new Date().toISOString()
      };
      
      setStatus(mockStatus);
      
      if (showFeedback) {
        toast({
          title: "✅ Status Atualizado",
          description: "Informações do sistema foram atualizadas",
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar status do sistema:', error);
      setError(t('systemStatus.unknownError'));
      
      if (showFeedback) {
        toast({
          title: "❌ Erro",
          description: "Não foi possível carregar o status do sistema",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemStatus();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => loadSystemStatus(), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>{t('systemStatus.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-brand-green" />
            <span className="ml-2 text-gray-600">{t('systemStatus.loadingStatus')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>{t('systemStatus.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error || t('systemStatus.unknownError')}</p>
            <Button 
              onClick={() => loadSystemStatus(true)}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('systemStatus.tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUptimeBadge = (uptime: number) => {
    if (uptime >= 99.5) return <Badge className="bg-green-100 text-green-700">{t('systemStatus.excellent')}</Badge>;
    if (uptime >= 98.0) return <Badge className="bg-yellow-100 text-yellow-700">{t('systemStatus.good')}</Badge>;
    return <Badge variant="destructive">{t('systemStatus.attention')}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-brand-green" />
            <span>{t('systemStatus.title')}</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge variant={status.api_online ? "default" : "destructive"}>
              {status.api_online ? (
                <><CheckCircle className="h-3 w-3 mr-1" />{t('systemStatus.online')}</>
              ) : (
                <><AlertTriangle className="h-3 w-3 mr-1" />{t('systemStatus.offline')}</>
              )}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadSystemStatus(true)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <Server className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-700">{status.bot_instances}</div>
            <div className="text-xs text-blue-600">{t('systemStatus.botInstances')}</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <Wifi className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-700">{status.connected_agents}</div>
            <div className="text-xs text-green-600">{t('systemStatus.onlineAgents')}</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-yellow-700">{status.reconnecting_agents}</div>
            <div className="text-xs text-yellow-600">{t('systemStatus.reconnecting')}</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-700">{status.total_messages_today.toLocaleString()}</div>
            <div className="text-xs text-purple-600">{t('systemStatus.msgsToday')}</div>
          </div>
        </div>

        {/* Métricas de performance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">{t('systemStatus.avgResponseTime')}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{status.avg_response_time.toFixed(1)}s</div>
              <div className="text-xs text-gray-500">
                {status.avg_response_time <= 1 ? t('systemStatus.excellent') : 
                 status.avg_response_time <= 2 ? t('systemStatus.good') : t('systemStatus.slow')}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">{t('systemStatus.availability')}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{status.uptime_percentage.toFixed(1)}%</div>
              <div className="text-xs">
                {getUptimeBadge(status.uptime_percentage)}
              </div>
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t('systemStatus.lastUpdate')}:</span>
            <span>{new Date(status.last_update).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Alerta para agentes reconectando */}
        {status.reconnecting_agents > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {status.reconnecting_agents} {t('systemStatus.reconnectingNote')}
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              {t('systemStatus.autoRecoveryNote')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemStatusPanel;
