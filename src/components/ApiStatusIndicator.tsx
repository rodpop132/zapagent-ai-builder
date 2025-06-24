
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';
import { useToast } from '@/hooks/use-toast';

const ApiStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  
  const isMountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkApiStatus = async (showToast: boolean = false, isRetry: boolean = false) => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    
    try {
      console.log('🔍 Verificando status da API ZapAgent...');
      
      // Timeout de 30 segundos para dar tempo ao servidor responder
      const status = await Promise.race([
        ZapAgentService.checkApiStatus(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na verificação da API')), 30000)
        )
      ]) as boolean;
      
      if (!isMountedRef.current) return;
      
      setIsOnline(status);
      setLastCheck(new Date());
      setIsReconnecting(false);
      setRetryCount(0);
      
      if (showToast) {
        toast({
          title: status ? "✅ API Online" : "⚠️ API Offline",
          description: status 
            ? "Serviço funcionando normalmente" 
            : "Servidor pode estar inicializando ou em manutenção",
          variant: status ? "default" : "destructive"
        });
      }
      
      console.log('🔍 Status da API ZapAgent:', status ? 'Online' : 'Offline');
      
    } catch (error: any) {
      console.error('❌ Erro ao verificar API:', error);
      
      if (!isMountedRef.current) return;
      
      // Distinguir entre timeout e outros erros
      if (error.message?.includes('Timeout')) {
        setIsReconnecting(true);
        setIsOnline(false);
        
        if (showToast) {
          toast({
            title: "⏰ Timeout na API",
            description: "Servidor demorou para responder. Tentando novamente...",
            variant: "destructive"
          });
        }
        
        // Retry automático em caso de timeout
        if (!isRetry && retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            if (isMountedRef.current) {
              checkApiStatus(false, true);
            }
          }, 10000); // Retry em 10 segundos
        }
      } else {
        setIsOnline(false);
        setIsReconnecting(false);
        setLastCheck(new Date());
        
        if (showToast) {
          toast({
            title: "❌ Erro de Conexão",
            description: "Não foi possível verificar o status da API",
            variant: "destructive"
          });
        }
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    checkApiStatus();
    
    // Polling adaptativo: mais frequente se offline/reconectando
    const getInterval = () => {
      if (isReconnecting || isOnline === false) return 30000; // 30 segundos
      return 120000; // 2 minutos se online
    };
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        checkApiStatus();
      }
    }, getInterval());
    
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOnline, isReconnecting]);

  const handleManualCheck = () => {
    setRetryCount(0);
    checkApiStatus(true);
  };

  const getStatusBadge = () => {
    if (loading) {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Verificando...</span>
        </Badge>
      );
    }
    
    if (isReconnecting) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center space-x-1">
          <Clock className="h-3 w-3 animate-pulse" />
          <span>Reconectando...</span>
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

  const getStatusMessage = () => {
    if (isReconnecting) return "Reconectando...";
    if (isOnline === false) return "Servidor pode estar inicializando";
    if (retryCount > 0) return `Tentativa ${retryCount}/3`;
    return null;
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
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
      
      {getStatusMessage() && (
        <span className="text-xs text-orange-600 hidden sm:block">
          {getStatusMessage()}
        </span>
      )}
    </div>
  );
};

export default ApiStatusIndicator;
