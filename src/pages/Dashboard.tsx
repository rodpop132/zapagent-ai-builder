
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, MessageCircle, Settings, BarChart3, Crown, LogOut, Menu } from 'lucide-react';
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
  is_unlimited?: boolean;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      console.log('📊 DASHBOARD: Carregando dados para:', user.email);
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchAgents(),
        fetchSubscription()
      ]);
    } catch (error) {
      console.error('❌ DASHBOARD: Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      console.log('🤖 DASHBOARD: Buscando agentes...');
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('✅ DASHBOARD: Agentes carregados:', data?.length || 0);
      setAgents(data || []);
    } catch (error) {
      console.error('❌ DASHBOARD: Erro ao buscar agentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agentes",
        variant: "destructive"
      });
    }
  };

  const fetchSubscription = async () => {
    try {
      console.log('💳 DASHBOARD: Buscando assinatura...');
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ DASHBOARD: Erro ao buscar assinatura:', error);
      } else {
        console.log('✅ DASHBOARD: Assinatura carregada:', data?.plan_type || 'none');
        setSubscription(data);
      }
    } catch (error) {
      console.error('❌ DASHBOARD: Erro na busca de assinatura:', error);
    }
  };

  const handleCreateAgent = () => {
    if (subscription?.is_unlimited) {
      setShowCreateModal(true);
      return;
    }

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
      case 'unlimited': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanDisplayName = (planType: string) => {
    switch (planType) {
      case 'free': return 'Gratuito';
      case 'pro': return 'Pro';
      case 'ultra': return 'Ultra';
      case 'unlimited': return '👑 Ilimitado';
      default: return 'Gratuito';
    }
  };

  const getMessagesDisplay = () => {
    if (subscription?.is_unlimited) {
      return '∞ Ilimitado';
    }
    return `${subscription?.messages_used || 0}/${subscription?.messages_limit || 30}`;
  };

  const handleSignOut = async () => {
    console.log('🚪 DASHBOARD: Fazendo logout...');
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ZA</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-brand-dark">ZapAgent AI</h1>
            </div>
            
            {/* Desktop Header Content */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge className={`${getPlanBadgeColor(subscription?.plan_type || 'free')} font-medium`}>
                  {getPlanDisplayName(subscription?.plan_type || 'free')}
                </Badge>
                {subscription?.plan_type === 'free' && !subscription?.is_unlimited && (
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
              
              <span className="text-sm text-gray-600 hidden lg:block">Olá, {user?.email}</span>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${getPlanBadgeColor(subscription?.plan_type || 'free')} font-medium`}>
                    {getPlanDisplayName(subscription?.plan_type || 'free')}
                  </Badge>
                  {subscription?.plan_type === 'free' && !subscription?.is_unlimited && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowUpgradeModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="text-brand-green border-brand-green hover:bg-brand-green hover:text-white"
                    >
                      <Crown className="h-4 w-4 mr-1" />
                      Upgrade
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-600">Olá, {user?.email}</p>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            { icon: Bot, label: 'Agentes', value: agents.length, color: 'text-brand-green' },
            { 
              icon: MessageCircle, 
              label: 'Mensagens', 
              value: getMessagesDisplay(), 
              color: 'text-blue-600'
            },
            { 
              icon: BarChart3, 
              label: 'Plano', 
              value: getPlanDisplayName(subscription?.plan_type || 'free'), 
              color: 'text-purple-600'
            },
            { 
              icon: Settings, 
              label: 'Ativos', 
              value: agents.filter(agent => agent.is_active).length, 
              color: 'text-orange-600'
            }
          ].map((stat, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all hover:scale-105"
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-6 w-6 md:h-8 md:w-8 ${stat.color}`} />
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agents Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Meus Agentes</h2>
            <Button 
              onClick={handleCreateAgent}
              className="bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-200 hover:scale-105 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Agente
            </Button>
          </div>

          {agents.length === 0 ? (
            <Card>
              <CardContent className="p-8 md:p-12 text-center">
                <Bot className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum agente criado ainda
                </h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base px-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onUpdate={fetchAgents}
                />
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
