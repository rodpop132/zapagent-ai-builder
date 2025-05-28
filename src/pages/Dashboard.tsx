
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, MessageCircle, Settings, BarChart3, Crown, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AgentCard from '@/components/AgentCard';
import CreateAgentModal from '@/components/CreateAgentModal';
import PlanUpgradeModal from '@/components/PlanUpgradeModal';

interface Agent {
  id: string;
  name: string;
  description: string;
  business_type: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

interface Subscription {
  plan_type: string;
  messages_used: number;
  messages_limit: number;
  status: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAgents();
      fetchSubscription();
    }
  }, [user]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agentes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleCreateAgent = () => {
    if (subscription?.plan_type === 'free' && agents.length >= 1) {
      toast({
        title: "Limite atingido",
        description: "No plano gratuito você pode criar apenas 1 agente. Faça upgrade para criar mais!",
        variant: "destructive"
      });
      return;
    }
    setShowCreateModal(true);
  };

  const onAgentCreated = () => {
    fetchAgents();
    setShowCreateModal(false);
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'free': return 'bg-gray-100 text-gray-700';
      case 'pro': return 'bg-blue-100 text-blue-700';
      case 'ultra': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanDisplayName = (planType: string) => {
    switch (planType) {
      case 'free': return 'Gratuito';
      case 'pro': return 'Pro';
      case 'ultra': return 'Ultra';
      default: return 'Gratuito';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-in fade-in-50 duration-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 animate-in slide-in-from-top-4 duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ZA</span>
              </div>
              <h1 className="text-xl font-bold text-brand-dark">ZapAgent AI</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Plan Badge */}
              <div className="flex items-center space-x-2">
                <Badge className={`${getPlanBadgeColor(subscription?.plan_type || 'free')} font-medium animate-in scale-in-50 duration-200`}>
                  {getPlanDisplayName(subscription?.plan_type || 'free')}
                </Badge>
                {subscription?.plan_type === 'free' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-brand-green border-brand-green hover:bg-brand-green hover:text-white transition-all duration-200 hover:scale-105"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Atualizar Plano
                  </Button>
                )}
              </div>
              
              <span className="text-sm text-gray-600">Olá, {user?.email}</span>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Bot, label: 'Agentes', value: agents.length, color: 'text-brand-green', delay: 0 },
            { 
              icon: MessageCircle, 
              label: 'Mensagens', 
              value: `${subscription?.messages_used || 0}/${subscription?.messages_limit || 30}`, 
              color: 'text-blue-600',
              delay: 100 
            },
            { 
              icon: BarChart3, 
              label: 'Plano', 
              value: getPlanDisplayName(subscription?.plan_type || 'free'), 
              color: 'text-purple-600',
              delay: 200 
            },
            { 
              icon: Settings, 
              label: 'Ativos', 
              value: agents.filter(agent => agent.is_active).length, 
              color: 'text-orange-600',
              delay: 300 
            }
          ].map((stat, index) => (
            <Card 
              key={index} 
              className="animate-in slide-in-from-bottom-4 duration-300 hover:shadow-lg transition-all hover:scale-105"
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agents Section */}
        <div className="mb-8 animate-in fade-in-50 duration-500 delay-400">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Meus Agentes</h2>
            <Button 
              onClick={handleCreateAgent}
              className="bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Agente
            </Button>
          </div>

          {agents.length === 0 ? (
            <Card className="animate-in scale-in-50 duration-500">
              <CardContent className="p-12 text-center">
                <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum agente criado ainda
                </h3>
                <p className="text-gray-600 mb-6">
                  Crie seu primeiro agente de IA para começar a automatizar seu atendimento no WhatsApp
                </p>
                <Button 
                  onClick={handleCreateAgent}
                  className="bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Agente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="animate-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${500 + (index * 100)}ms` }}
                >
                  <AgentCard
                    agent={agent}
                    onUpdate={fetchAgents}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAgentCreated={onAgentCreated}
      />

      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription?.plan_type || 'free'}
      />
    </div>
  );
};

export default Dashboard;
