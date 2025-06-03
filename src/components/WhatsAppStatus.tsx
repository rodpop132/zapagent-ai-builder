
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, QrCode } from 'lucide-react';
import { ZapAgentService } from '@/services/zapAgentService';

interface WhatsAppStatusProps {
  phoneNumber: string;
  onStatusChange?: (status: 'connected' | 'pending') => void;
}

const WhatsAppStatus = ({ phoneNumber, onStatusChange }: WhatsAppStatusProps) => {
  const [status, setStatus] = useState<'connected' | 'pending' | 'loading'>('loading');
  const [qrCode, setQrCode] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    try {
      setChecking(true);
      console.log('🔍 Verificando conexão WhatsApp para:', phoneNumber);
      
      const qrResponse = await ZapAgentService.getQrCode(phoneNumber);
      
      if (qrResponse.conectado) {
        console.log('✅ WhatsApp conectado');
        setStatus('connected');
        onStatusChange?.('connected');
      } else {
        console.log('⏳ WhatsApp pendente de conexão');
        setStatus('pending');
        onStatusChange?.('pending');
        if (qrResponse.qr_code) {
          setQrCode(qrResponse.qr_code);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
      setStatus('pending');
      onStatusChange?.('pending');
    } finally {
      setChecking(false);
    }
  };

  const handleShowQrCode = async () => {
    setShowQrModal(true);
    if (!qrCode || status === 'pending') {
      await checkConnection();
    }
  };

  const generateNewQrCode = async () => {
    try {
      console.log('🔄 Gerando novo QR Code...');
      const qrResponse = await ZapAgentService.getQrCode(phoneNumber);
      
      if (qrResponse.conectado) {
        setStatus('connected');
        onStatusChange?.('connected');
      } else if (qrResponse.qr_code) {
        setQrCode(qrResponse.qr_code);
        setStatus('pending');
        onStatusChange?.('pending');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar novo QR Code:', error);
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      checkConnection();
      
      // Verificar status a cada 30 segundos
      const interval = setInterval(checkConnection, 30000);
      return () => clearInterval(interval);
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

      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
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
                
                {qrCode ? (
                  <div className="flex justify-center">
                    <img 
                      src={qrCode} 
                      alt="QR Code do WhatsApp" 
                      className="max-w-full h-auto border rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-brand-green mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Carregando QR Code...</p>
                    </div>
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ⏳ Aguardando conexão com o WhatsApp...
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Após escanear, a conexão será verificada automaticamente
                  </p>
                </div>
                
                <Button
                  onClick={generateNewQrCode}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novo QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppStatus;
