
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, AlertTriangle, WifiOff } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';

const ApiStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkApiStatus = async () => {
    setLoading(true);
    try {
      const status = await ZapAgentService.checkApiStatus();
      setIsOnline(status);
      console.log('🔍 Status da API ZapAgent:', status ? 'Online' : 'Offline');
    } catch (error) {
      console.error('❌ Erro ao verificar API:', error);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Verificar status a cada 2 minutos (reduzido de 5 minutos)
    const interval = setInterval(checkApiStatus, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        {isOnline === null ? (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Verificando...</span>
          </Badge>
        ) : isOnline ? (
          <Badge variant="default" className="bg-green-100 text-green-700 flex items-center space-x-1">
            <Server className="h-3 w-3" />
            <span>API Online</span>
          </Badge>
        ) : (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>API Indisponível</span>
          </Badge>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={checkApiStatus}
        disabled={loading}
        className="h-6 w-6 p-0"
        title="Verificar status da API"
      >
        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
      </Button>
      
      {isOnline === false && (
        <span className="text-xs text-orange-600 hidden sm:block">
          Servidor pode estar inicializando
        </span>
      )}
    </div>
  );
};

export default ApiStatusIndicator;
