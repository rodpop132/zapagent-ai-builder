
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

  const fetchQrCode = async () => {
    try {
      const botUrl = `https://zapagent-bot.onrender.com/qrcode?numero=${encodeURIComponent(phoneNumber)}`;
      
      const response = await fetch(botUrl);
      if (!response.ok) {
        console.error('Erro na resposta do QR code:', response.status, response.statusText);
        throw new Error('Erro ao buscar QR code');
      }
      
      // A API retorna HTML, não JSON
      const htmlContent = await response.text();
      console.log('HTML QR recebido (primeiros 200 chars):', htmlContent.substring(0, 200));
      
      // Extrair a imagem base64 do HTML
      const imgMatch = htmlContent.match(/src="(data:image\/png;base64,[^"]+)"/);
      if (imgMatch && imgMatch[1]) {
        console.log('QR code extraído com sucesso do HTML');
        setQrCode(imgMatch[1]);
      } else {
        console.error('QR code não encontrado no HTML');
        throw new Error('QR code não encontrado no HTML');
      }
    } catch (error) {
      console.error('Erro ao buscar QR code:', error);
    }
  };

  const checkStatus = async () => {
    try {
      // Usar timeout para evitar requisições que ficam pendentes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout
      
      const apiUrl = `https://zapagent-api.onrender.com/status?numero=${encodeURIComponent(phoneNumber)}`;
      
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Erro ao verificar status');
      
      const data = await response.json();
      const newStatus = data.connected ? 'connected' : 'pending';
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      
      // Se aguardando conexão, buscar QR code
      if (!data.connected) {
        await fetchQrCode();
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      if (error.name === 'AbortError') {
        console.log('Verificação de status cancelada por timeout');
      }
      setStatus('pending');
      // Em caso de erro, ainda tentar buscar QR code
      await fetchQrCode();
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      checkStatus();
      
      // Verificar status a cada 30 segundos
      const interval = setInterval(checkStatus, 30000);
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
          action: null
        };
      case 'pending':
        return {
          text: 'Aguardando conexão',
          color: 'text-red-600',
          icon: '🔴',
          action: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowQrModal(true)}
              className="ml-2 text-xs"
            >
              Ver QR Code
            </Button>
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
                  className="max-w-full h-auto border rounded-lg"
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
            
            <Button
              onClick={() => {
                fetchQrCode();
                checkStatus();
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
