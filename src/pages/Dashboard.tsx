import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, MessageCircle, Settings, BarChart3, Crown, LogOut, Menu, RefreshCw, TrendingUp, Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AgentCard from '@/components/AgentCard';
import CreateAgentModal from '@/components/CreateAgentModal';
import PlanUpgradeModal from '@/components/PlanUpgradeModal';
import LanguageSelector from '@/components/LanguageSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SupportNotifications from '@/components/SupportNotifications';

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

interface Subscription {
  plan_type: string;
  messages_used: number;
  messages_limit: number;
  status: string;
  is_unlimited?: boolean;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [verifyingSubscription, setVerifyingSubscription] = useState(false);
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

      if (error) {
        console.error('❌ DASHBOARD: Erro ao buscar agentes:', error);
        throw error;
      }
      
      console.log('✅ DASHBOARD: Agentes carregados:', data?.length || 0);
      setAgents(data || []);
      return data || [];
    } catch (error) {
      console.error('❌ DASHBOARD: Erro ao buscar agentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agentes",
        variant: "destructive"
      });
      return [];
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
        throw error;
      }

      if (error && error.code === 'PGRST116') {
        console.log('📝 DASHBOARD: Criando assinatura gratuita padrão...');
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user?.id,
            plan_type: 'free',
            status: 'active',
            messages_used: 0,
            messages_limit: 30,
            is_unlimited: false
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ DASHBOARD: Erro ao criar assinatura:', createError);
          const defaultSub = {
            plan_type: 'free',
            status: 'active',
            messages_used: 0,
            messages_limit: 30,
            is_unlimited: false
          };
          setSubscription(defaultSub);
          console.log('⚠️ DASHBOARD: Usando assinatura padrão offline');
        } else {
          console.log('✅ DASHBOARD: Assinatura gratuita criada');
          setSubscription(newSub);
        }
      } else {
        console.log('✅ DASHBOARD: Assinatura carregada:', data?.plan_type || 'none');
        setSubscription(data);
      }
    } catch (error) {
      console.error('❌ DASHBOARD: Erro na busca de assinatura:', error);
      const defaultSub = {
        plan_type: 'free',
        status: 'active',
        messages_used: 0,
        messages_limit: 30,
        is_unlimited: false
      };
      setSubscription(defaultSub);
      console.log('⚠️ DASHBOARD: Usando assinatura padrão devido a erro');
    }
  };

  const getAgentLimitByPlan = (planType: string) => {
    switch (planType) {
      case 'free': return 1;
      case 'pro': return 3; // Corrigido de 5 para 3
      case 'ultra': return 999999;
      case 'unlimited': return 999999;
      default: return 1;
    }
  };

  const getMessagesLimitByPlan = (planType: string) => {
    switch (planType) {
      case 'free': return 30;
      case 'pro': return 1000; // Corrigido de 10000 para 1000
      case 'ultra': return 999999;
      case 'unlimited': return 999999;
      default: return 30;
    }
  };

  const verifySubscription = async () => {
    setVerifyingSubscription(true);
    try {
      console.log('🔄 DASHBOARD: Verificando assinatura no Stripe...');
      
      const response = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ DASHBOARD: Verificação completa:', result);
        
        toast({
          title: "Verificação completa",
          description: `Plano atualizado: ${result.plan_type}`,
          variant: "default"
        });
        
        // Recarregar dados
        await fetchSubscription();
      } else {
        throw new Error('Erro na verificação');
      }
    } catch (error) {
      console.error('❌ DASHBOARD: Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar sua assinatura",
        variant: "destructive"
      });
    } finally {
      setVerifyingSubscription(false);
    }
  };

  const canCreateAgent = () => {
    if (loading || !subscription) {
      console.log('⏳ VERIFICAÇÃO LIMITE: Ainda carregando dados...');
      return false;
    }

    const planType = subscription.plan_type || 'free';
    const currentAgentCount = agents.length;
    const agentLimit = getAgentLimitByPlan(planType);
    
    const canCreate = currentAgentCount < agentLimit;
    
    console.log('🔍 VERIFICAÇÃO LIMITE:', {
      planType,
      currentAgentCount,
      agentLimit,
      canCreate,
      subscriptionLoaded: !!subscription,
      agentsLoaded: agents !== null
    });
    
    return canCreate;
  };

  const handleCreateAgent = () => {
    console.log('🎯 Tentativa de criar agente...');
    
    if (loading) {
      toast({
        title: "Aguarde",
        description: "Carregando informações do usuário...",
        variant: "default"
      });
      return;
    }

    if (!canCreateAgent()) {
      const planType = subscription?.plan_type || 'free';
      const agentLimit = getAgentLimitByPlan(planType);
      
      console.log('❌ Limite atingido:', {
        planType,
        currentCount: agents.length,
        limit: agentLimit
      });
      
      toast({
        title: "Limite atingido",
        description: `No plano ${getPlanDisplayName(planType)} você pode criar até ${agentLimit} agente${agentLimit > 1 ? 's' : ''}. Faça upgrade para criar mais!`,
        variant: "destructive"
      });
      setShowUpgradeModal(true);
      return;
    }
    
    console.log('✅ Pode criar agente, abrindo modal...');
    setShowCreateModal(true);
  };

  const onAgentCreated = async () => {
    console.log('🔄 Agente criado, recarregando lista...');
    await fetchAgents();
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
    return t(`userDashboard.planNames.${planType}`) || t('userDashboard.planNames.free');
  };

  const getTotalMessagesUsed = () => {
    return agents.reduce((total, agent) => total + (agent.messages_used || 0), 0);
  };

  const getMessagesDisplay = () => {
    if (subscription?.is_unlimited) {
      return '∞ Ilimitado';
    }
    const totalUsed = getTotalMessagesUsed();
    const limit = getMessagesLimitByPlan(subscription?.plan_type || 'free');
    return `${totalUsed}/${limit}`;
  };

  const shouldShowLimitWarning = () => {
    if (subscription?.is_unlimited) return false;
    const totalUsed = getTotalMessagesUsed();
    const limit = getMessagesLimitByPlan(subscription?.plan_type || 'free');
    return totalUsed >= limit * 0.8;
  };

  const shouldShowUpgradeButton = () => {
    if (subscription?.is_unlimited) return false;
    return subscription?.plan_type === 'free' || subscription?.plan_type === 'pro';
  };

  const getUpgradeButtonText = () => {
    if (subscription?.plan_type === 'pro') {
      return 'Upgrade para Ultra';
    }
    return 'Atualizar Plano';
  };

  const handleSignOut = async () => {
    console.log('🚪 DASHBOARD: Fazendo logout...');
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-green mx-auto mb-6 shadow-lg"></div>
          <p className="text-gray-600 text-lg font-medium">{t('userDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const planType = subscription?.plan_type || 'free';
  const agentLimit = getAgentLimitByPlan(planType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-100 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-green to-green-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="text-white font-bold text-lg">ZA</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">ZapAgent AI</h1>
                <p className="text-sm text-gray-500 hidden md:block">Dashboard Profissional</p>
              </div>
            </div>
            
            {/* Desktop Header Content */}
            <div className="hidden md:flex items-center space-x-6">
              <LanguageSelector />
              <div className="flex items-center space-x-3">
                <Badge className={`${getPlanBadgeColor(subscription?.plan_type || 'free')} font-semibold px-3 py-1 text-sm shadow-sm`}>
                  {getPlanDisplayName(subscription?.plan_type || 'free')}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={verifySubscription}
                  disabled={verifyingSubscription}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${verifyingSubscription ? 'animate-spin' : ''}`} />
                  {verifyingSubscription ? t('userDashboard.verifying') : t('userDashboard.verifyPlan')}
                </Button>
                {shouldShowUpgradeButton() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-brand-green border-brand-green/30 hover:bg-brand-green hover:text-white transition-all duration-200 hover:scale-105 shadow-sm"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    {getUpgradeButtonText()}
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">{t('userDashboard.welcome')}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 shadow-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('userDashboard.logout')}
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 bg-gray-50/50 rounded-b-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <LanguageSelector />
                  <Badge className={`${getPlanBadgeColor(subscription?.plan_type || 'free')} font-medium`}>
                    {getPlanDisplayName(subscription?.plan_type || 'free')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={verifySubscription}
                      disabled={verifyingSubscription}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${verifyingSubscription ? 'animate-spin' : ''}`} />
                      {t('userDashboard.verifyPlan')}
                    </Button>
                    {shouldShowUpgradeButton() && (
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
                        {t('userDashboard.upgrade')}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-center py-2">
                  <p className="text-sm font-medium text-gray-900">{t('userDashboard.welcome')}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('userDashboard.logout')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Enhanced Limit Warning */}
        {shouldShowLimitWarning() && (
          <Alert className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-sm">
            <Activity className="h-4 w-4" />
            <AlertDescription className="text-amber-800 font-medium">
              {t('userDashboard.limitWarning')}
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="ml-2 text-brand-green hover:underline font-semibold transition-colors"
              >
                {t('userDashboard.planUpgrade')}
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {[
            { 
              icon: Bot, 
              label: t('userDashboard.agents'), 
              value: `${agents.length}/${agentLimit === 999999 ? '∞' : agentLimit}`, 
              color: 'from-brand-green to-green-600',
              bgColor: 'bg-green-50',
              iconColor: 'text-green-600'
            },
            { 
              icon: MessageCircle, 
              label: t('userDashboard.messages'), 
              value: getMessagesDisplay(), 
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50',
              iconColor: 'text-blue-600'
            },
            { 
              icon: BarChart3, 
              label: t('userDashboard.plan'), 
              value: getPlanDisplayName(subscription?.plan_type || 'free'), 
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50',
              iconColor: 'text-purple-600'
            },
            { 
              icon: TrendingUp, 
              label: t('userDashboard.active'), 
              value: agents.filter(agent => agent.is_active).length, 
              color: 'from-orange-500 to-orange-600',
              bgColor: 'bg-orange-50',
              iconColor: 'text-orange-600'
            }
          ].map((stat, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-white/80 backdrop-blur-sm group"
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-6 w-6 md:h-7 md:w-7 ${stat.iconColor}`} />
                  </div>
                  <div className="text-right min-w-0 flex-1 ml-3">
                    <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className={`h-1 w-full bg-gradient-to-r ${stat.color} rounded-full mt-3 md:mt-4 opacity-20 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Agents Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t('userDashboard.myAgents')}</h2>
              <p className="text-gray-600">Gerencie seus assistentes virtuais</p>
            </div>
            <Button 
              onClick={handleCreateAgent}
              className="bg-gradient-to-r from-brand-green to-green-600 hover:from-brand-green/90 hover:to-green-600/90 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
              disabled={loading}
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              {loading ? t('userDashboard.loading') : t('userDashboard.createAgent')}
            </Button>
          </div>

          {/* Enhanced Plan info message */}
          {!loading && !canCreateAgent() && (
            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Crown className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800 mb-1">{t('userDashboard.limitReached')}</h4>
                  <p className="text-sm text-yellow-700">
                    {t('userDashboard.limitInfo', { planName: getPlanDisplayName(planType), limit: agentLimit })}
                    <button 
                      onClick={() => setShowUpgradeModal(true)}
                      className="ml-2 text-brand-green hover:underline font-semibold transition-colors"
                    >
                      {t('userDashboard.planUpgrade')}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {agents.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 md:p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t('userDashboard.noAgentsYet')}
                </h3>
                <p className="text-gray-600 mb-8 text-base max-w-md mx-auto leading-relaxed">
                  {t('userDashboard.noAgentsDescription')}
                </p>
                <Button 
                  onClick={handleCreateAgent}
                  className="bg-gradient-to-r from-brand-green to-green-600 hover:from-brand-green/90 hover:to-green-600/90 text-white transition-all duration-300 hover:scale-105 shadow-lg"
                  disabled={loading}
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {loading ? t('userDashboard.loading') : t('userDashboard.createFirstAgent')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onUpdate={fetchAgents}
                  subscription={subscription}
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

      {/* Support Notifications */}
      <SupportNotifications />
    </div>
  );
};

export default Dashboard;
