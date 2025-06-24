
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, QrCode, Clock, CheckCircle } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';
import { normalizarNumero } from '@/utils/phoneUtils';
import { handleJWTError } from '@/utils/authUtils';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppStatusProps {
  phoneNumber: string;
  onStatusChange?: (status: 'connected' | 'pending' | 'reconnecting') => void;
}

const WhatsAppStatus = ({ phoneNumber, onStatusChange }: WhatsAppStatusProps) => {
  const [status, setStatus] = useState<'connected' | 'pending' | 'reconnecting' | 'loading'>('loading');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastStatusCheck, setLastStatusCheck] = useState<Date | null>(null);
  const [qrRetryCount, setQrRetryCount] = useState(0);
  const { toast } = useToast();
  
  // Refs para controle de componente montado e intervals
  const isMountedRef = useRef(true);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const devLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WhatsAppStatus] ${message}`, data || '');
    }
  };

  // Verificar conexão com timeout aumentado e melhor tratamento de erros
  const checkConnection = async (showUserFeedback = false) => {
    if (!phoneNumber || !isMountedRef.current) return;
    
    try {
      if (isMountedRef.current) setChecking(true);
      if (isMountedRef.current) setError('');
      
      const numeroNormalizado = normalizarNumero(phoneNumber);
      devLog('🔍 Verificando conexão para número:', numeroNormalizado);
      
      if (!numeroNormalizado || numeroNormalizado.length < 10) {
        throw new Error('Número de telefone inválido');
      }
      
      // Timeout aumentado para 45 segundos para dar tempo ao bot reconectar
      const statusResponse = await Promise.race([
        ZapAgentService.verifyConnection(numeroNormalizado),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na verificação')), 45000)
        )
      ]) as any;
      
      if (!isMountedRef.current) return;
      
      if (typeof statusResponse !== 'object' || statusResponse === null) {
        throw new Error('Resposta inesperada do servidor');
      }
      
      setLastStatusCheck(new Date());
      
      // Status detalhado baseado na resposta
      if (statusResponse.conectado === true) {
        devLog('✅ Agente conectado');
        setStatus('connected');
        onStatusChange?.('connected');
        
        if (showUserFeedback) {
          toast({
            title: "✅ WhatsApp Conectado",
            description: "Agente está online e pronto para receber mensagens",
            variant: "default"
          });
        }
      } else if (statusResponse.reconnecting === true || statusResponse.status === 'reconnecting') {
        devLog('🔄 Agente reconectando');
        setStatus('reconnecting');
        onStatusChange?.('reconnecting');
        
        if (showUserFeedback) {
          toast({
            title: "🔄 Reconectando...",
            description: "O agente está se reconectando ao WhatsApp. Isso pode demorar até 15 segundos.",
            variant: "default"
          });
        }
      } else {
        devLog('⏳ Agente pendente');
        setStatus('pending');
        onStatusChange?.('pending');
      }
      
    } catch (error) {
      devLog('❌ Erro ao verificar conexão:', error);
      
      if (handleJWTError(error, toast)) {
        return;
      }
      
      if (!isMountedRef.current) return;
      
      // Distinguir entre timeout e outros erros
      if (error instanceof Error && error.message.includes('Timeout')) {
        setStatus('reconnecting');
        onStatusChange?.('reconnecting');
        setError('Servidor demorou para responder. O agente pode estar reconectando...');
      } else {
        setStatus('pending');
        onStatusChange?.('pending');
        setError(error instanceof Error ? error.message : 'Erro na comunicação');
      }
    } finally {
      if (isMountedRef.current) setChecking(false);
    }
  };

  // Buscar QR Code com retry automático
  const loadQrCode = async (isRetry = false) => {
    if (!phoneNumber || !isMountedRef.current) return;
    
    try {
      if (isMountedRef.current) setQrLoading(true);
      if (isMountedRef.current && !isRetry) setError('');
      if (isMountedRef.current) setQrCodeData('');
      
      const numeroNormalizado = normalizarNumero(phoneNumber);
      devLog('📱 Carregando QR code para:', numeroNormalizado);
      
      if (!numeroNormalizado || numeroNormalizado.length < 10) {
        throw new Error('Número de telefone inválido');
      }
      
      const qrResponse = await ZapAgentService.getQrCode(numeroNormalizado);
      devLog('📋 Resposta QR:', qrResponse);

      if (!isMountedRef.current) return;

      // Agente já conectado
      if (qrResponse.conectado === true) {
        devLog('✅ Agente já conectado - fechando modal');
        setStatus('connected');
        onStatusChange?.('connected');
        setShowQrModal(false);
        setQrRetryCount(0);
        
        toast({
          title: "✅ WhatsApp Conectado",
          description: "O agente já está conectado ao WhatsApp",
          variant: "default"
        });
        return;
      }

      // QR Code disponível
      if (qrResponse.qr_code && 
          typeof qrResponse.qr_code === 'string' && 
          qrResponse.qr_code.startsWith('data:image/png;base64,')) {
        devLog('📱 QR Code válido recebido');
        setQrCodeData(qrResponse.qr_code);
        setError('');
        setQrRetryCount(0);
      } else if (qrResponse.message) {
        devLog('📨 Mensagem do backend:', qrResponse.message);
        
        // QR ainda não gerado - tentar novamente em breve
        if (qrResponse.message.includes('ainda não gerado') || qrResponse.message.includes('não disponível')) {
          setError('QR code está sendo gerado... Aguarde.');
          setQrRetryCount(prev => prev + 1);
          
          // Retry automático se não passou de 10 tentativas
          if (qrRetryCount < 10 && showQrModal) {
            setTimeout(() => {
              if (isMountedRef.current && showQrModal) {
                loadQrCode(true);
              }
            }, 3000); // Retry a cada 3 segundos
          }
        } else {
          setError(qrResponse.message);
          setQrCodeData('');
        }
      } else {
        setError('QR code não disponível. Tente novamente.');
        setQrCodeData('');
      }
      
    } catch (error) {
      devLog('❌ Erro ao carregar QR code:', error);
      
      if (handleJWTError(error, toast)) {
        return;
      }
      
      if (!isMountedRef.current) return;
      
      let errorMessage = 'Erro ao comunicar com o servidor.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = 'Servidor demorou para responder. Tentando novamente...';
          
          // Retry automático em caso de timeout
          if (qrRetryCount < 5 && showQrModal) {
            setTimeout(() => {
              if (isMountedRef.current && showQrModal) {
                loadQrCode(true);
              }
            }, 5000);
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setQrCodeData('');
    } finally {
      if (isMountedRef.current) setQrLoading(false);
    }
  };

  // Iniciar polling automático do QR quando modal estiver aberto
  const startQrPolling = () => {
    if (qrUpdateIntervalRef.current) {
      clearInterval(qrUpdateIntervalRef.current);
    }
    
    qrUpdateIntervalRef.current = setInterval(() => {
      if (isMountedRef.current && showQrModal && status !== 'connected') {
        devLog('⏰ Polling automático do QR code');
        loadQrCode(true);
      }
    }, 15000); // Atualizar QR a cada 15 segundos
  };

  const handleShowQrCode = async () => {
    devLog('🔄 Abrindo modal QR code');
    setShowQrModal(true);
    setQrRetryCount(0);
    await loadQrCode();
    startQrPolling();
  };

  const handleCloseQrModal = () => {
    devLog('🚪 Fechando modal QR code');
    setShowQrModal(false);
    setQrCodeData('');
    setError('');
    setQrRetryCount(0);
    
    if (qrUpdateIntervalRef.current) {
      clearInterval(qrUpdateIntervalRef.current);
      qrUpdateIntervalRef.current = null;
    }
  };

  // Verificação inicial e polling de status mais inteligente
  useEffect(() => {
    if (phoneNumber && isMountedRef.current) {
      devLog('🚀 Iniciando verificação para:', phoneNumber);
      checkConnection();
      
      // Clear interval anterior
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      
      // Polling adaptativo baseado no status
      statusIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          const interval = status === 'reconnecting' ? 15000 : 45000; // 15s se reconectando, 45s se normal
          devLog(`⏰ Verificação automática (${status})`);
          checkConnection();
        }
      }, status === 'reconnecting' ? 15000 : 45000);
    }
    
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    };
  }, [phoneNumber, status]);

  // Cleanup ao desmontar
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      if (qrUpdateIntervalRef.current) {
        clearInterval(qrUpdateIntervalRef.current);
      }
    };
  }, []);

  const getStatusBadge = () => {
    switch (status) {
      case 'loading':
        return (
          <Badge variant="secondary" className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Verificando...
          </Badge>
        );
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
        );
      case 'reconnecting':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            Reconectando...
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive" className="text-xs">
            <WifiOff className="h-3 w-3 mr-1" />
            Desconectado
          </Badge>
        );
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />;
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'reconnecting':
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getStatusIcon()}
          {getStatusBadge()}
          
          {status === 'reconnecting' && (
            <span className="text-xs text-yellow-600 truncate">
              Aguarde até 15s...
            </span>
          )}
          
          {error && status !== 'reconnecting' && (
            <span className="text-xs text-red-600 max-w-xs truncate" title={error}>
              {error}
            </span>
          )}
          
          {lastStatusCheck && (
            <span className="text-xs text-gray-500 hidden lg:block">
              {lastStatusCheck.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex space-x-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkConnection(true)}
            disabled={checking}
            className="text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${checking ? 'animate-spin' : ''}`} />
            Verificar
          </Button>
          
          {status !== 'connected' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowQrCode}
              className="text-xs"
            >
              <QrCode className="h-3 w-3 mr-1" />
              QR Code
            </Button>
          )}
        </div>
      </div>

      {/* Modal do QR Code aprimorado */}
      <Dialog open={showQrModal} onOpenChange={handleCloseQrModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-brand-green" />
              <span>Conectar WhatsApp</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            {status === 'connected' ? (
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  WhatsApp Conectado!
                </h3>
                <p className="text-sm text-green-600">
                  O agente está online e pronto para receber mensagens
                </p>
              </div>
            ) : status === 'reconnecting' ? (
              <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  Reconectando...
                </h3>
                <p className="text-sm text-yellow-600">
                  O agente está se reconectando automaticamente. Aguarde até 15 segundos.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Escaneie o QR Code abaixo com seu WhatsApp para conectar o agente
                </p>
                
                {error ? (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center mb-2">
                      <RefreshCw className="h-4 w-4 text-blue-600 animate-spin mr-2" />
                      <p className="text-sm text-blue-800 font-medium">Sistema Inteligente</p>
                    </div>
                    <p className="text-xs text-blue-700">{error}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {qrRetryCount > 0 && `Tentativa ${qrRetryCount}/10 - `}
                      O sistema está atualizando automaticamente a cada 15 segundos.
                    </p>
                  </div>
                ) : qrLoading ? (
                  <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-brand-green mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Carregando QR Code...</p>
                      <p className="text-xs text-gray-500 mt-1">Aguarde alguns segundos</p>
                    </div>
                  </div>
                ) : qrCodeData ? (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeData} 
                        alt="QR Code do WhatsApp" 
                        style={{ width: '280px', height: '280px' }}
                        className="border rounded-lg shadow-lg"
                        onError={() => {
                          devLog('❌ Erro ao carregar imagem QR');
                          setError('Erro ao exibir QR code - tentando recarregar...');
                          setTimeout(() => loadQrCode(true), 2000);
                        }}
                        onLoad={() => {
                          devLog('✅ QR code exibido com sucesso');
                        }}
                      />
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 mb-1">
                        📱 <strong>Como conectar:</strong>
                      </p>
                      <p className="text-xs text-blue-700">
                        WhatsApp → Menu (3 pontos) → Aparelhos conectados → Conectar aparelho
                      </p>
                    </div>
                    
                    <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        QR Code atualiza automaticamente a cada 15 segundos
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">QR Code não disponível</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Clique em "Atualizar QR" para tentar novamente
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={() => loadQrCode()}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={qrLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${qrLoading ? 'animate-spin' : ''}`} />
                    {qrLoading ? 'Carregando...' : 'Atualizar QR'}
                  </Button>
                  
                  <Button
                    onClick={() => checkConnection(true)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={checking}
                  >
                    <Wifi className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                    Verificar Status
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppStatus;
