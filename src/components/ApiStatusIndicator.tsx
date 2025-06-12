
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';
import { useToast } from '@/hooks/use-toast';

const ApiStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkApiStatus = async (showToast: boolean = false) => {
    setLoading(true);
    try {
      console.log('🔍 Verificando status da API ZapAgent...');
      const status = await ZapAgentService.checkApiStatus();
      setIsOnline(status);
      setLastCheck(new Date());
      
      if (showToast) {
        toast({
          title: status ? "✅ API Online" : "❌ API Offline",
          description: status ? "Serviço funcionando normalmente" : "Servidor pode estar inicializando",
          variant: status ? "default" : "destructive"
        });
      }
      
      console.log('🔍 Status da API ZapAgent:', status ? 'Online' : 'Offline');
    } catch (error: any) {
      console.error('❌ Erro ao verificar API:', error);
      setIsOnline(false);
      setLastCheck(new Date());
      
      if (showToast) {
        toast({
          title: "❌ Erro de Conexão",
          description: "Não foi possível verificar o status da API",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Verificar status a cada 2 minutos
    const interval = setInterval(() => checkApiStatus(), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualCheck = () => {
    checkApiStatus(true);
  };

  const getStatusBadge = () => {
    if (isOnline === null) {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Verificando...</span>
        </Badge>
      );
    }
    
    if (isOnline) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>API Online</span>
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <AlertTriangle className="h-3 w-3" />
        <span>API Indisponível</span>
      </Badge>
    );
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        {getStatusBadge()}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualCheck}
        disabled={loading}
        className="h-6 w-6 p-0"
        title="Verificar status da API"
      >
        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
      </Button>
      
      {lastCheck && (
        <span className="text-xs text-gray-500 hidden md:block">
          Última verificação: {lastCheck.toLocaleTimeString()}
        </span>
      )}
      
      {isOnline === false && (
        <span className="text-xs text-orange-600 hidden sm:block">
          Servidor pode estar inicializando
        </span>
      )}
    </div>
  );
};

export default ApiStatusIndicator;
