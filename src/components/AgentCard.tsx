import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Settings, MessageCircle, Phone, Users, MoreVertical, Edit, History, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import WhatsAppStatus from './WhatsAppStatus';
import EditAgentModal from './EditAgentModal';
import AgentHistory from './AgentHistory';
import { ZapAgentService } from '@/services/zapAgentService';

interface Agent {
  id: string;
  name: string;
  description: string;
  business_type: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  personality_prompt?: string;
  messages_used?: number;
  messages_limit?: number;
}

interface Subscription {
  plan_type: string;
  messages_used: number;
  messages_limit: number;
  status: string;
  is_unlimited?: boolean;
}

interface AgentCardProps {
  agent: Agent;
  onUpdate: () => void;
  subscription: Subscription | null;
}

const AgentCard = ({ agent, onUpdate, subscription }: AgentCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<'connected' | 'pending' | 'reconnecting'>('pending');
  const [agentStats, setAgentStats] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const getMessagesLimitByPlan = (planType: string) => {
    switch (planType) {
      case 'free': return 30;
      case 'pro': return 10000; // Corrigido para 10.000
      case 'ultra': return 999999;
      case 'unlimited': return 999999;
      default: return 30;
    }
  };

  const loadAgentStats = async () => {
    try {
      const statusData = await ZapAgentService.getAgentStatus(agent.phone_number);
      setAgentStats(statusData);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas do agente:', error);
    }
  };

  const handleToggleActive = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ is_active: !agent.is_active })
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Agente ${!agent.is_active ? 'ativado' : 'desativado'} com sucesso`,
        variant: "default"
      });
      
      onUpdate();
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

  const handleDeleteAgent = async () => {
    if (!confirm('Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agente excluído com sucesso",
        variant: "default"
      });
      
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir agente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Faça login para testar mensagens",
        variant: "destructive"
      });
      return;
    }

    if (whatsappStatus !== 'connected') {
      toast({
        title: "WhatsApp não conectado",
        description: "Conecte o WhatsApp primeiro para testar mensagens",
        variant: "destructive"
      });
      return;
    }

    // Verificar limite de mensagens
    const planType = subscription?.plan_type || 'free';
    const limit = getMessagesLimitByPlan(planType);
    const used = agentStats?.mensagens_enviadas || 0;

    if (!subscription?.is_unlimited && used >= limit) {
      toast({
        title: "Limite de mensagens atingido",
        description: `Você atingiu o limite de ${limit} mensagens do plano ${planType}. Faça upgrade para continuar.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🧪 Enviando mensagem de teste para agente:', agent.phone_number);
      
      const prompt = agent.personality_prompt || `Você é um assistente virtual para ${agent.business_type}. Seja prestativo e educado.`;
      const testMessage = 'Olá! Esta é uma mensagem de teste do sistema.';
      
      // Enviar mensagem com persistência
      const response = await ZapAgentService.sendMessage(
        agent.phone_number,
        testMessage,
        prompt,
        user.id, // userId do usuário autenticado
        agent.id, // agentId
        agent.name // agentName
      );

      console.log('✅ Resposta da IA:', response);

      if (response.success) {
        toast({
          title: "✅ Teste enviado",
          description: "Mensagem de teste enviada e salva com sucesso!",
          variant: "default"
        });

        // Recarregar estatísticas e dados do agente
        await loadAgentStats();
        onUpdate();
      } else {
        throw new Error(response.error || 'Erro desconhecido');
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar a mensagem de teste",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimitReached = () => {
    toast({
      title: "Limite de mensagens atingido",
      description: "Este agente atingiu o limite de mensagens. Considere fazer upgrade do seu plano.",
      variant: "destructive"
    });
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
  };

  const getBusinessTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'Comércio': '🛍️',
      'Restaurante': '🍽️',
      'Serviços': '🔧',
      'Saúde': '🏥',
      'Educação': '🎓',
      'Imobiliária': '🏠',
      'Tecnologia': '💻',
      'Outros': '📋'
    };
    return icons[type] || '📋';
  };

  const messagesUsed = agentStats?.mensagens_enviadas || 0;
  const planType = subscription?.plan_type || 'free';
  const messagesLimit = subscription?.is_unlimited ? '∞' : getMessagesLimitByPlan(planType);
  const isLimitReached = !subscription?.is_unlimited && messagesUsed >= getMessagesLimitByPlan(planType);

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-brand-green">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-green to-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                {getBusinessTypeIcon(agent.business_type)}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-gray-900 truncate group-hover:text-brand-green transition-colors">
                  {agent.name}
                </CardTitle>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  {agent.business_type}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={agent.is_active ? "default" : "secondary"} className="text-xs">
                {agent.is_active ? "Ativo" : "Inativo"}
              </Badge>
              
              {isLimitReached && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Limite
                </Badge>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => setShowEditModal(true)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Configurar Bot
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setShowHistory(!showHistory);
                      if (!showHistory) loadAgentStats();
                    }}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {showHistory ? 'Ocultar' : 'Ver'} Histórico
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleToggleActive}
                    disabled={isLoading}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {agent.is_active ? 'Desativar' : 'Ativar'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDeleteAgent}
                    disabled={isLoading}
                    className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Excluir Agente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {agent.description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {agent.description}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              <Phone className="h-4 w-4 mr-2 text-brand-green" />
              <span className="font-mono">{formatPhoneNumber(agent.phone_number)}</span>
            </div>

            <WhatsAppStatus 
              phoneNumber={agent.phone_number}
              onStatusChange={setWhatsappStatus}
            />

            <div className={`flex items-center justify-between text-sm p-2 rounded-lg ${
              isLimitReached ? 'bg-red-50' : 'bg-blue-50'
            }`}>
              <div className={`flex items-center ${isLimitReached ? 'text-red-700' : 'text-blue-700'}`}>
                <MessageCircle className="h-4 w-4 mr-2" />
                <span>Mensagens</span>
              </div>
              <span className={`font-semibold ${isLimitReached ? 'text-red-800' : 'text-blue-800'}`}>
                {messagesUsed}/{messagesLimit}
              </span>
            </div>

            {isLimitReached && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700">
                  ⚠️ Limite de mensagens atingido. O agente não pode enviar mais respostas.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendTestMessage}
              disabled={isLoading || whatsappStatus !== 'connected' || isLimitReached}
              className="flex-1 hover:bg-brand-green hover:text-white hover:border-brand-green transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Testar'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditModal(true)}
              className="flex-1 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </CardContent>

        {/* Histórico de conversas */}
        {showHistory && user && (
          <CardContent className="pt-0">
            <AgentHistory 
              phoneNumber={agent.phone_number}
              agentName={agent.name}
              subscription={subscription}
            />
          </CardContent>
        )}
      </Card>

      <EditAgentModal
        agent={agent}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onAgentUpdated={onUpdate}
      />
    </>
  );
};

export default AgentCard;
