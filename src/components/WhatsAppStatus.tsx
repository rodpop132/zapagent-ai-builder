
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WhatsAppStatusProps {
  phoneNumber: string;
  onStatusChange?: (status: 'connected' | 'pending') => void;
}

const WhatsAppStatus = ({ phoneNumber, onStatusChange }: WhatsAppStatusProps) => {
  const [status, setStatus] = useState<'connected' | 'pending' | 'loading'>('loading');
  const [qrCode, setQrCode] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);

  const checkConnectionStatus = async () => {
    try {
      console.log('🔍 Verificando status para:', phoneNumber);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Usar a nova rota de status
      const response = await fetch(`https://zapagent-bot.onrender.com/status?numero=${encodeURIComponent(phoneNumber)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('❌ Erro na verificação de status:', response.status);
        throw new Error('Erro ao verificar status');
      }
      
      const statusData = await response.json();
      console.log('📊 Status recebido:', statusData);
      
      if (statusData.conectado === true) {
        console.log('✅ Status: CONECTADO');
        setStatus('connected');
        onStatusChange?.('connected');
        return true;
      } else {
        console.log('⏳ Status: PENDENTE');
        setStatus('pending');
        onStatusChange?.('pending');
        return false;
      }
    } catch (error) {
      console.error('💥 Erro ao verificar status:', error);
      if (error.name === 'AbortError') {
        console.log('⏰ Verificação de status cancelada por timeout');
      }
      setStatus('pending');
      onStatusChange?.('pending');
      return false;
    }
  };

  const fetchQrCode = async () => {
    try {
      console.log('🔄 Buscando QR code para:', phoneNumber);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`https://zapagent-bot.onrender.com/qrcode?numero=${encodeURIComponent(phoneNumber)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('❌ Erro na resposta do QR code:', response.status, response.statusText);
        throw new Error('Erro ao buscar QR code');
      }
      
      const htmlContent = await response.text();
      console.log('📄 HTML QR recebido (primeiros 300 chars):', htmlContent.substring(0, 300));
      
      // Verificar se retornou mensagem de QR não encontrado (significa que está conectado)
      if (htmlContent.includes('QR não encontrado')) {
        console.log('✅ Agente já está conectado (QR não encontrado)');
        setStatus('connected');
        onStatusChange?.('connected');
        return;
      }
      
      // Extrair a imagem base64 do HTML
      const imgMatch = htmlContent.match(/src\s*=\s*["'](data:image\/[^;]+;base64,[^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        console.log('✅ QR code extraído com sucesso');
        setQrCode(imgMatch[1]);
        setStatus('pending');
        onStatusChange?.('pending');
      } else {
        console.error('❌ QR code não encontrado no HTML');
        throw new Error('QR code não encontrado no HTML');
      }
    } catch (error) {
      console.error('💥 Erro ao buscar QR code:', error);
      setStatus('pending');
      onStatusChange?.('pending');
    }
  };

  const handleManualCheck = async () => {
    console.log('🔄 Verificação manual solicitada pelo usuário');
    setStatus('loading');
    await checkConnectionStatus();
  };

  const handleShowQrCode = async () => {
    setShowQrModal(true);
    if (!qrCode) {
      await fetchQrCode();
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      checkConnectionStatus();
      
      // Verificar status a cada 30 segundos
      const interval = setInterval(checkConnectionStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [phoneNumber]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'connected':
        return {
          text: 'Conectado',
          color: 'text-green-600',
          icon: '🟢',
          action: (
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualCheck}
              className="ml-2 text-xs"
            >
              Verificar
            </Button>
          )
        };
      case 'pending':
        return {
          text: 'Aguardando conexão',
          color: 'text-red-600',
          icon: '🔴',
          action: (
            <div className="flex gap-1 ml-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleShowQrCode}
                className="text-xs"
              >
                Ver QR Code
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualCheck}
                className="text-xs"
              >
                Verificar
              </Button>
            </div>
          )
        };
      case 'loading':
        return {
          text: 'Verificando...',
          color: 'text-gray-600',
          icon: '⏳',
          action: null
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <>
      <div className="flex items-center text-sm">
        <span className="mr-1">{statusInfo.icon}</span>
        <span className={statusInfo.color}>{statusInfo.text}</span>
        {statusInfo.action}
      </div>

      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Escaneie o QR Code abaixo com seu WhatsApp para conectar o agente
            </p>
            
            {qrCode ? (
              <div className="flex justify-center">
                <img 
                  src={qrCode} 
                  alt="QR Code do WhatsApp" 
                  className="max-w-full h-auto border rounded-lg shadow-lg"
                  onError={(e) => {
                    console.error('❌ Erro ao carregar imagem do QR code');
                  }}
                  onLoad={() => {
                    console.log('✅ QR code carregado com sucesso na UI');
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-2"></div>
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
              onClick={() => {
                console.log('🔄 Atualizando QR Code e status manualmente');
                fetchQrCode();
                handleManualCheck();
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Atualizar QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppStatus;
