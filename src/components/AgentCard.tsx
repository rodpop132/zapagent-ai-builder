
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Settings, Trash2, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WhatsAppStatus from './WhatsAppStatus';

interface Agent {
  id: string;
  name: string;
  description: string;
  business_type: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  whatsapp_status?: 'connected' | 'pending';
}

interface AgentCardProps {
  agent: Agent;
  onUpdate: () => void;
}

const AgentCard = ({ agent, onUpdate }: AgentCardProps) => {
  const [loading, setLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<'connected' | 'pending'>(
    agent.whatsapp_status || 'pending'
  );
  const { toast } = useToast();

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
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
      const { error } = await supabase
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
    
    // Atualizar no banco de dados
    try {
      await supabase
        .from('agents')
        .update({ whatsapp_status: status })
        .eq('id', agent.id);
    } catch (error) {
      console.error('Error updating WhatsApp status:', error);
    }
  };

  return (
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

        {agent.phone_number && (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">WhatsApp:</span> {agent.phone_number}
            </div>
            <WhatsAppStatus 
              phoneNumber={agent.phone_number}
              onStatusChange={handleWhatsAppStatusChange}
            />
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
  );
};

export default AgentCard;
