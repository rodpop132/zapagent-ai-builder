
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Agent {
  id: string;
  name: string;
  description: string;
  business_type: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  prompt?: string;
  messages_used?: number;
  messages_limit?: number;
}

interface EditAgentModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onAgentUpdated: () => void;
}

const businessTypes = [
  'Comércio',
  'Restaurante', 
  'Serviços',
  'Saúde',
  'Educação',
  'Imobiliária',
  'Tecnologia',
  'Outros'
];

const EditAgentModal = ({ agent, isOpen, onClose, onAgentUpdated }: EditAgentModalProps) => {
  const [formData, setFormData] = useState({
    name: agent.name,
    description: agent.description,
    business_type: agent.business_type,
    prompt: agent.prompt || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('agents')
        .update({
          name: formData.name,
          description: formData.description,
          business_type: formData.business_type,
          personality_prompt: formData.prompt
        })
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agente atualizado com sucesso",
        variant: "default"
      });

      onAgentUpdated();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar agente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Bot - {agent.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Agente</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Assistente da Loja"
              required
            />
          </div>

          <div>
            <Label htmlFor="business_type">Tipo de Negócio</Label>
            <Select
              value={formData.business_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de negócio" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva brevemente o que seu agente faz..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="prompt">Prompt/Personalidade do Bot</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Ex: Você é um assistente virtual prestativo de uma loja de roupas. Seja amigável e sempre ofereça ajuda com produtos, tamanhos e promoções..."
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Este texto define como seu bot vai se comportar nas conversas
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentModal;
