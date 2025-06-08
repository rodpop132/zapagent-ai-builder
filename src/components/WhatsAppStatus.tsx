
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, QrCode } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';
import { normalizarNumero } from '@/utils/phoneUtils';
import { handleJWTError } from '@/utils/authUtils';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppStatusProps {
  phoneNumber: string;
  onStatusChange?: (status: 'connected' | 'pending') => void;
}

const WhatsAppStatus = ({ phoneNumber, onStatusChange }: WhatsAppStatusProps) => {
  const [status, setStatus] = useState<'connected' | 'pending' | 'loading'>('loading');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const checkConnection = async () => {
    if (!phoneNumber) return;
    
    try {
      setChecking(true);
      setError('');
      
      // SEMPRE normalizar o número
      const numeroNormalizado = normalizarNumero(phoneNumber);
      console.log('🔍 WhatsAppStatus: Verificando conexão para número normalizado:', numeroNormalizado);
      
      if (!numeroNormalizado || numeroNormalizado.length < 10) {
        throw new Error('Número de telefone inválido');
      }
      
      const statusResponse = await ZapAgentService.verifyConnection(numeroNormalizado);
      
      if (statusResponse.conectado === true) {
        console.log('✅ WhatsAppStatus: Agente conectado');
        setStatus('connected');
        onStatusChange?.('connected');
      } else {
        console.log('⏳ WhatsAppStatus: Agente pendente');
        setStatus('pending');
        onStatusChange?.('pending');
      }
    } catch (error) {
      console.error('❌ WhatsAppStatus: Erro ao verificar conexão:', error);
      
      // Tratar erro de JWT
      if (handleJWTError(error, toast)) {
        return;
      }
      
      setStatus('pending');
      onStatusChange?.('pending');
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setChecking(false);
    }
  };

  const loadQrCode = async () => {
    if (!phoneNumber) return;
    
    try {
      setQrLoading(true);
      setError('');
      
      // SEMPRE normalizar o número
      const numeroNormalizado = normalizarNumero(phoneNumber);
      console.log('📱 WhatsAppStatus: Carregando QR code para número normalizado:', numeroNormalizado);
      
      if (!numeroNormalizado || numeroNormalizado.length < 10) {
        throw new Error('Número de telefone inválido');
      }
      
      const qrResponse = await ZapAgentService.getQrCode(numeroNormalizado);
      
      if (qrResponse.conectado) {
        console.log('✅ WhatsAppStatus: Agente já conectado');
        setStatus('connected');
        onStatusChange?.('connected');
        setShowQrModal(false);
        return;
      }
      
      if (qrResponse.qrcodeUrl) {
        console.log('📱 WhatsAppStatus: QR Code URL obtida:', qrResponse.qrcodeUrl);
        setQrCodeUrl(qrResponse.qrcodeUrl);
      } else {
        throw new Error('QR code não disponível no momento');
      }
      
    } catch (error) {
      console.error('❌ WhatsAppStatus: Erro ao carregar QR code:', error);
      
      // Tratar erro de JWT
      if (handleJWTError(error, toast)) {
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar QR code';
      setError(errorMessage);
      setQrCodeUrl('');
    } finally {
      setQrLoading(false);
    }
  };

  const handleShowQrCode = async () => {
    console.log('🔄 WhatsAppStatus: Abrindo modal QR code...');
    setShowQrModal(true);
    setError('');
    
    if (!qrCodeUrl) {
      await loadQrCode();
    }
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    setQrCodeUrl('');
    setError('');
  };

  // Verificar status inicialmente e a cada 30 segundos
  useEffect(() => {
    if (phoneNumber) {
      console.log('🚀 WhatsAppStatus: Iniciando verificação para:', phoneNumber);
      checkConnection();
      
      const interval = setInterval(() => {
        console.log('⏰ WhatsAppStatus: Verificação automática...');
        checkConnection();
      }, 30000);
      
      return () => {
        console.log('🛑 WhatsAppStatus: Limpando interval');
        clearInterval(interval);
      };
    }
  }, [phoneNumber]);

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          {status === 'loading' ? (
            <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
          ) : status === 'connected' ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          
          <Badge 
            variant={status === 'connected' ? 'default' : 'destructive'}
            className={status === 'connected' ? 'bg-green-100 text-green-700' : ''}
          >
            {status === 'loading' ? 'Verificando...' : 
             status === 'connected' ? 'Conectado' : 'Desconectado'}
          </Badge>
          
          {error && (
            <span className="text-xs text-red-600 max-w-xs truncate" title={error}>
              {error}
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={checking}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${checking ? 'animate-spin' : ''}`} />
            Verificar
          </Button>
          
          {status !== 'connected' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowQrCode}
            >
              <QrCode className="h-3 w-3 mr-1" />
              QR Code
            </Button>
          )}
        </div>
      </div>

      {/* Modal do QR Code */}
      <Dialog open={showQrModal} onOpenChange={handleCloseQrModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            {status === 'connected' ? (
              <div className="p-6 bg-green-50 rounded-lg">
                <Wifi className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  WhatsApp Conectado!
                </h3>
                <p className="text-sm text-green-600">
                  O agente está pronto para receber mensagens
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Escaneie o QR Code abaixo com seu WhatsApp para conectar o agente
                </p>
                
                {error ? (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 font-medium mb-2">Erro ao carregar QR Code</p>
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                ) : qrLoading ? (
                  <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-brand-green mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Carregando QR Code...</p>
                    </div>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code do WhatsApp" 
                        style={{ width: '300px', height: '300px' }}
                        className="border rounded-lg shadow-lg"
                        onError={(e) => {
                          console.error('❌ WhatsAppStatus: Erro ao carregar imagem QR');
                          setError('Erro ao exibir QR code');
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('✅ WhatsAppStatus: QR code carregado na UI');
                        }}
                      />
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        📱 WhatsApp → Menu → Aparelhos conectados → Conectar aparelho
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">QR Code não disponível</p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    onClick={loadQrCode}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={qrLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${qrLoading ? 'animate-spin' : ''}`} />
                    {qrLoading ? 'Carregando...' : 'Atualizar QR'}
                  </Button>
                  
                  <Button
                    onClick={checkConnection}
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
