
import { Loader2, Bot, Phone, Building, FileText, Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface CreationStatusDisplayProps {
  creationState: 'idle' | 'saving' | 'creating_zapagent' | 'awaiting_qr' | 'success' | 'error';
  error: string;
  qrcodeUrl: string | null;
  agentName: string;
}

const CreationStatusDisplay = ({ creationState, error, qrcodeUrl, agentName }: CreationStatusDisplayProps) => {
  const getStateMessage = () => {
    switch (creationState) {
      case 'saving':
        return { icon: Loader2, text: 'Salvando agente...', className: 'text-blue-600' };
      case 'creating_zapagent':
        return { icon: Bot, text: 'Registrando na API...', className: 'text-purple-600' };
      case 'awaiting_qr':
        return { icon: Clock, text: 'Aguardando QR code... (pode demorar até 10s)', className: 'text-orange-600' };
      case 'success':
        return { icon: CheckCircle, text: 'Agente criado com sucesso!', className: 'text-green-600' };
      case 'error':
        return { icon: AlertCircle, text: 'Erro ao criar agente', className: 'text-red-600' };
      default:
        return null;
    }
  };

  const formatQrCodeUrl = (url: string | null) => {
    if (!url) return null;
    
    // Se a URL já é completa (começa com http), usa ela diretamente
    if (url.startsWith('http')) {
      return url;
    }
    
    // Se é base64, usa diretamente
    if (url.startsWith('data:image')) {
      return url;
    }
    
    // Se começa com "/", é uma URL relativa do backend
    if (url.startsWith('/')) {
      return `https://zapagent-bot.onrender.com${url}`;
    }
    
    // Se não tem prefixo, assume que é base64 sem o data prefix
    return `data:image/png;base64,${url}`;
  };

  const isProcessing = ['saving', 'creating_zapagent', 'awaiting_qr'].includes(creationState);
  const isComplete = creationState === 'success';
  const hasError = creationState === 'error';

  if (!isProcessing && !isComplete && !hasError) return null;

  const formattedQrUrl = formatQrCodeUrl(qrcodeUrl);

  return (
    <div className={`p-4 rounded-lg border ${
      isComplete ? 'bg-green-50 border-green-200' :
      hasError ? 'bg-red-50 border-red-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      {(() => {
        const state = getStateMessage();
        if (!state) return null;
        const Icon = state.icon;
        return (
          <div className="flex items-center">
            <Icon className={`h-5 w-5 mr-3 ${state.className} ${isProcessing ? 'animate-spin' : ''}`} />
            <span className={`font-medium ${state.className}`}>{state.text}</span>
          </div>
        );
      })()}
      
      {hasError && error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      {/* QR Code durante o processo de espera */}
      {creationState === 'awaiting_qr' && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3">
            Agente criado! Aguardando geração do QR code...
          </p>
          {formattedQrUrl ? (
            <div className="flex justify-center">
              <img 
                src={formattedQrUrl}
                alt="QR Code do WhatsApp" 
                className="w-48 h-48 border rounded-lg"
                onError={(e) => {
                  console.log('⏰ Erro ao carregar QR Code:', formattedQrUrl);
                  console.error('Erro na imagem:', e);
                }}
                onLoad={() => {
                  console.log('✅ QR Code carregado com sucesso:', formattedQrUrl);
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-48 h-48 border rounded-lg bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Gerando QR Code...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code quando está completo */}
      {isComplete && (
        <div className="mt-4">
          <p className="text-green-700 font-medium mb-3">
            🎉 Agente "{agentName}" criado com sucesso!
          </p>
          {formattedQrUrl ? (
            <>
              <p className="text-sm text-green-600 mb-3">
                Escaneie o QR Code abaixo com seu WhatsApp:
              </p>
              <div className="flex justify-center">
                <img 
                  src={formattedQrUrl}
                  alt="QR Code do WhatsApp" 
                  className="w-48 h-48 border rounded-lg"
                  onError={() => {
                    console.log('⏰ Erro ao carregar QR Code final:', formattedQrUrl);
                  }}
                  onLoad={() => {
                    console.log('✅ QR Code final carregado:', formattedQrUrl);
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                WhatsApp → Menu → Aparelhos conectados → Conectar aparelho
              </p>
            </>
          ) : (
            <p className="text-sm text-green-600 mt-1">
              Você pode configurar o WhatsApp na lista de agentes.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CreationStatusDisplay;
