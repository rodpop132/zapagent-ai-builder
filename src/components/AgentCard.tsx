
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageCircle, Settings, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  description: string;
  business_type: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

interface AgentCardProps {
  agent: Agent;
  onUpdate: () => void;
}

const AgentCard = ({ agent, onUpdate }: AgentCardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleActive = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ is_active: !agent.is_active })
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Agente atualizado",
        description: `Agente ${agent.is_active ? 'desativado' : 'ativado'} com sucesso`
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async () => {
    if (!confirm('Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Agente excluído",
        description: "Agente removido com sucesso"
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-brand-green" />
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="capitalize">{agent.business_type}</CardDescription>
            </div>
          </div>
          <Badge variant={agent.is_active ? "default" : "secondary"}>
            {agent.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {agent.description || 'Sem descrição'}
        </p>
        
        {agent.phone_number && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <MessageCircle className="h-4 w-4 mr-2" />
            {agent.phone_number}
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleActive}
            disabled={loading}
            className="flex-1"
          >
            {agent.is_active ? 'Desativar' : 'Ativar'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={deleteAgent}
            disabled={loading}
            className="px-3 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;
