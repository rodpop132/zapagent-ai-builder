
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
      console.log('🔄 Buscando QR code para status:', phoneNumber);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`https://zapagent-bot.onrender.com/qrcode?numero=${encodeURIComponent(phoneNumber)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; ZapAgent/1.0)',
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
        console.log('✅ QR code extraído com sucesso para status');
        
        if (imgMatch[1].startsWith('data:image/') && imgMatch[1].includes('base64,')) {
          setQrCode(imgMatch[1]);
          setStatus('pending');
          onStatusChange?.('pending');
        } else {
          throw new Error('QR code extraído não é uma imagem base64 válida');
        }
      } else {
        console.error('❌ QR code não encontrado no HTML');
        throw new Error('QR code não encontrado no HTML');
      }
    } catch (error) {
      console.error('💥 Erro ao buscar QR code:', error);
      setStatus('pending');
    }
  };

  const checkStatus = async () => {
    try {
      console.log('🔍 Verificando status para:', phoneNumber);
      setStatus('loading');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Primeiro tentar endpoint de status direto se existir
      try {
        const statusResponse = await fetch(`https://zapagent-bot.onrender.com/status?numero=${encodeURIComponent(phoneNumber)}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('📊 Status direto recebido:', statusData);
          
          if (statusData.connected === true || statusData.status === 'connected') {
            console.log('✅ Status direto: CONECTADO');
            setStatus('connected');
            onStatusChange?.('connected');
            clearTimeout(timeoutId);
            return;
          }
        }
      } catch (statusError) {
        console.log('⚠️ Endpoint de status não disponível, usando QR check');
      }
      
      // Fallback para verificação via QR
      const response = await fetch(`https://zapagent-bot.onrender.com/qrcode?numero=${encodeURIComponent(phoneNumber)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('❌ Erro na verificação de status:', response.status);
        throw new Error('Erro ao verificar status');
      }
      
      const htmlContent = await response.text();
      console.log('📊 Status verificado (primeiros 200 chars):', htmlContent.substring(0, 200));
      
      // Verificações mais rigorosas para detectar conexão
      const connectedIndicators = [
        'QR não encontrado',
        'já está conectado',
        'connected',
        'conectado',
        'session active',
        'sessão ativa'
      ];
      
      const isConnected = connectedIndicators.some(indicator => 
        htmlContent.toLowerCase().includes(indicator.toLowerCase())
      );
      
      if (isConnected) {
        console.log('✅ Status atualizado: CONECTADO');
        setStatus('connected');
        onStatusChange?.('connected');
      } else {
        console.log('⏳ Status atualizado: PENDENTE');
        setStatus('pending');
        onStatusChange?.('pending');
        
        // Tentar extrair QR code para exibir se necessário
        const imgMatch = htmlContent.match(/src\s*=\s*["'](data:image\/[^;]+;base64,[^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          setQrCode(imgMatch[1]);
        }
      }
    } catch (error) {
      console.error('💥 Erro ao verificar status:', error);
      if (error.name === 'AbortError') {
        console.log('⏰ Verificação de status cancelada por timeout');
      }
      setStatus('pending');
    }
  };

  const handleManualCheck = async () => {
    console.log('🔄 Verificação manual solicitada pelo usuário');
    await checkStatus();
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
                onClick={() => setShowQrModal(true)}
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
                    console.log('🔗 URL da imagem:', qrCode?.substring(0, 100) + '...');
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
            
            <Button
              onClick={() => {
                console.log('🔄 Atualizando QR Code e status manualmente');
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
