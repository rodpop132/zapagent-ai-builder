import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Settings, Trash2, Play, Pause, MessageCircle, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WhatsAppStatus from './WhatsAppStatus';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Agent {
  id: string;
  name: string;
  description: string;
  business_type: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  whatsapp_status?: string;
}

interface AgentCardProps {
  agent: Agent;
  onUpdate: () => void;
}

const AgentCard = ({ agent, onUpdate }: AgentCardProps) => {
  const [loading, setLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<'connected' | 'pending'>(
    (agent.whatsapp_status as 'connected' | 'pending') || 'pending'
  );
  const [messagesCount] = useState(Math.floor(Math.random() * 100)); // Placeholder
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const { toast } = useToast();

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('agents')
        .update({ is_active: !agent.is_active })
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: agent.is_active ? "Agente pausado" : "Agente ativado",
        description: `O agente foi ${agent.is_active ? 'pausado' : 'ativado'} com sucesso`
      });

      onUpdate();
    } catch (error) {
      console.error('Error toggling agent:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do agente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este agente?')) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('agents')
        .delete()
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Agente excluído",
        description: "O agente foi removido com sucesso"
      });

      onUpdate();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppStatusChange = async (status: 'connected' | 'pending') => {
    setWhatsappStatus(status);
    
    try {
      const { error } = await (supabase as any)
        .from('agents')
        .update({ whatsapp_status: status })
        .eq('id', agent.id);

      if (error) {
        console.error('Error updating WhatsApp status:', error);
      }
    } catch (error) {
      console.error('Error updating WhatsApp status:', error);
    }
  };

  const fetchQrCode = async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando QR code para AgentCard:', agent.phone_number);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`https://zapagent-bot.onrender.com/qrcode?numero=${encodeURIComponent(agent.phone_number)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar QR code');
      }
      
      const htmlContent = await response.text();
      
      // Verificar se retornou mensagem de QR não encontrado
      if (htmlContent.includes('QR não encontrado')) {
        toast({
          title: "Agente Conectado",
          description: "Este agente já está conectado ao WhatsApp",
        });
        return;
      }
      
      // Extrair a imagem base64 do HTML
      const imgMatch = htmlContent.match(/src\s*=\s*["'](data:image\/[^;]+;base64,[^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        setQrCode(imgMatch[1]);
        setShowQrModal(true);
      } else {
        throw new Error('QR code não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar QR code:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível carregar o QR code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMessageLimitColor = (count: number) => {
    if (count < 10) return 'text-red-600';
    if (count < 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-102">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <CardDescription className="text-sm">
                  {agent.business_type}
                </CardDescription>
              </div>
            </div>
            <Badge variant={agent.is_active ? "default" : "secondary"}>
              {agent.is_active ? "Ativo" : "Pausado"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {agent.description && (
            <p className="text-sm text-gray-600">{agent.description}</p>
          )}

          {/* Contador de mensagens */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Mensagens:</span>
            </div>
            <span className={`text-sm font-medium ${getMessageLimitColor(messagesCount)}`}>
              {messagesCount}/30
            </span>
          </div>

          {agent.phone_number && (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">WhatsApp:</span> {agent.phone_number}
              </div>
              <div className="flex items-center justify-between">
                <WhatsAppStatus 
                  phoneNumber={agent.phone_number}
                  onStatusChange={handleWhatsAppStatusChange}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchQrCode}
                  disabled={loading}
                  className="text-xs"
                >
                  <QrCode className="w-3 h-3 mr-1" />
                  QR Code
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Criado em {new Date(agent.created_at).toLocaleDateString('pt-BR')}
          </div>

          <div className="flex space-x-2">
            <Button
              variant={agent.is_active ? "secondary" : "default"}
              size="sm"
              onClick={handleToggleActive}
              disabled={loading}
              className="flex-1"
            >
              {agent.is_active ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Ativar
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal do QR Code */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Aponte a câmera do seu WhatsApp para conectar este agente
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Carregando QR Code...</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AgentCard;
