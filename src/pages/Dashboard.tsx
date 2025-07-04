import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, MessageCircle, BarChart3, Crown, RefreshCw, TrendingUp, Activity, Menu, X, Home, LineChart, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AgentCard from '@/components/AgentCard';
import CreateAgentModal from '@/components/CreateAgentModal';
import PlanUpgradeModal from '@/components/PlanUpgradeModal';
import LanguageSelector from '@/components/LanguageSelector';
import ProfileMenu from '@/components/ProfileMenu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SupportNotifications from '@/components/SupportNotifications';
import { ZapAgentService } from '@/services/zapAgentService';
import MetricsPage from '@/components/dashboard/MetricsPage';
import MessageGeneratorPage from '@/components/dashboard/MessageGeneratorPage';

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

interface GlobalUsageData {
  totalMessagesUsed: number;
  activeAgents: number;
  agentsCount: number;
}

function getAgentLimitByPlan(planType: string) {
  switch (planType) {
    case 'free': return 1;
    case 'pro': return 3;
    case 'ultra': return 999999;
    case 'unlimited': return 999999;
    default: return 1;
  }
}

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [globalUsage, setGlobalUsage] = useState<GlobalUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [verifyingSubscription, setVerifyingSubscription] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const { toast } = useToast();

  // Menu items with translations
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'metrics', name: t('userDashboard.metrics'), icon: LineChart },
    { id: 'message-generator', name: t('userDashboard.messageGenerator'), icon: Sparkles },
  ];

  // Calculate planType and agentLimit once
  const planType = subscription?.plan_type || 'free';
  const agentLimit = getAgentLimitByPlan(planType);

  const getMessagesLimitByPlan = (planType: string) => {
    switch (planType) {
      case 'free': return 30;
      case 'pro': return 10000;
      case 'ultra': return 999999;
      case 'unlimited': return 999999;
      default: return 30;
    }
  };

  const loadGlobalUsage = async () => {
    if (!user?.id || agents.length === 0) return;
    
    try {
      console.log('📊 Carregando uso global de mensagens...');
      
      // Buscar dados de todos os agentes
      const promises = agents.map(agent => 
        ZapAgentService.getMessagesUsed(user.id, agent.phone_number)
      );
      
      const results = await Promise.all(promises);
      
      // Calcular totais
      const totalMessagesUsed = results.reduce((sum, data) => 
        sum + (data?.mensagensUsadas || 0), 0
      );
      
      const activeAgents = results.reduce((sum, data) => 
        sum + (data?.agentesAtivos || 0), 0
      );

      setGlobalUsage({
        totalMessagesUsed,
        activeAgents,
        agentsCount: agents.length
      });
      
      setLastUpdate(new Date());
      
      console.log('✅ Uso global carregado:', {
        totalMessagesUsed,
        activeAgents,
        agentsCount: agents.length
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar uso global:', error);
    }
  };

  const refreshAllData = async () => {
    try {
      console.log('🔄 Atualizando todos os dados...');
      await Promise.all([
        fetchAgents(),
        fetchSubscription()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('📊 DASHBOARD: Carregando dados para:', user.email);
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (agents.length > 0) {
      loadGlobalUsage();
    }
  }, [agents, user?.id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled || agents.length === 0) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh: Atualizando dados...');
      loadGlobalUsage();
      
      // Refresh agents status every 2 minutes
      if (Math.floor(Date.now() / 1000) % 120 === 0) {
        refreshAllData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [agents, autoRefreshEnabled, user?.id]);

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

  const getMessagesDisplay = () => {
    if (subscription?.is_unlimited) {
      return '∞';
    }
    const totalUsed = globalUsage?.totalMessagesUsed || 0;
    const limit = getMessagesLimitByPlan(subscription?.plan_type || 'free');
    return `${totalUsed}/${limit}`;
  };

  const shouldShowLimitWarning = () => {
    if (subscription?.is_unlimited) return false;
    const totalUsed = globalUsage?.totalMessagesUsed || 0;
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    toast({
      title: autoRefreshEnabled ? "Auto-refresh desativado" : "Auto-refresh ativado",
      description: autoRefreshEnabled ? "Os dados não serão mais atualizados automaticamente" : "Os dados serão atualizados a cada 30 segundos",
      variant: "default"
    });
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'metrics':
        return <MetricsPage agents={agents} globalUsage={globalUsage} subscription={subscription} />;
      case 'message-generator':
        return <MessageGeneratorPage />;
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <div className="fade-in">
      {/* Limit Warning */}
      {shouldShowLimitWarning() && (
        <Alert className="mb-8 border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 shadow-sm">
          <Activity className="h-4 w-4" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 font-medium">
            {t('userDashboard.limitWarning')}
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="ml-2 text-brand-green hover:underline font-semibold transition-colors duration-300"
            >
              {t('userDashboard.planUpgrade')}
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {[
          { 
            icon: Bot, 
            label: t('userDashboard.agents'), 
            value: `${agents.length}/${agentLimit === 999999 ? '∞' : agentLimit}`, 
            color: 'from-brand-green to-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            iconColor: 'text-green-600 dark:text-green-400'
          },
          { 
            icon: MessageCircle, 
            label: t('userDashboard.messages'), 
            value: getMessagesDisplay(), 
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
            loading: !globalUsage && agents.length > 0
          },
          { 
            icon: BarChart3, 
            label: t('userDashboard.plan'), 
            value: getPlanDisplayName(subscription?.plan_type || 'free'), 
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            iconColor: 'text-purple-600 dark:text-purple-400'
          },
          { 
            icon: TrendingUp, 
            label: t('userDashboard.active'), 
            value: globalUsage?.activeAgents || agents.filter(agent => agent.is_active).length, 
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            iconColor: 'text-orange-600 dark:text-orange-400',
            loading: !globalUsage && agents.length > 0
          }
        ].map((stat, index) => (
          <Card 
            key={index} 
            className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor} transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 md:h-7 md:w-7 ${stat.iconColor}`} />
                </div>
                <div className="text-right min-w-0 flex-1 ml-3">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white transition-transform duration-300">
                    {stat.loading ? (
                      <RefreshCw className="h-5 w-5 animate-spin inline" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              </div>
              <div className={`h-1 w-full bg-gradient-to-r ${stat.color} rounded-full mt-3 md:mt-4 opacity-20 transition-all duration-500`}></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Auto-refresh indicator */}
      <div className="mb-6 flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${autoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {autoRefreshEnabled ? t('userDashboard.autoRefreshActive') : t('userDashboard.autoRefreshInactive')}
          </span>
          <span className="text-xs text-gray-500">
            {t('userDashboard.lastUpdate')}: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className="text-xs"
          >
            {autoRefreshEnabled ? t('userDashboard.pauseAutoRefresh') : t('userDashboard.activateAutoRefresh')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {t('userDashboard.update')}
          </Button>
        </div>
      </div>

      {/* Agents Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('userDashboard.myAgents')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('userDashboard.manageVirtualAssistants')}</p>
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

        {/* Plan info message */}
        {!loading && !canCreateAgent() && (
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">{t('userDashboard.limitReached')}</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {t('userDashboard.limitInfo', { planName: getPlanDisplayName(planType), limit: agentLimit })}
                  <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="ml-2 text-brand-green hover:underline font-semibold transition-all duration-300"
                  >
                    {t('userDashboard.planUpgrade')}
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {agents.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8 md:p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('userDashboard.noAgentsYet')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-base max-w-md mx-auto leading-relaxed">
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
            {agents.map((agent, index) => (
              <div key={agent.id}>
                <AgentCard
                  agent={agent}
                  onUpdate={fetchAgents}
                  subscription={subscription}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar with smooth animations */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      } lg:relative lg:translate-x-0 lg:opacity-100 ${
        sidebarOpen ? 'lg:block' : 'lg:hidden'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 animate-fade-in">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-green-600 rounded-lg flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
              <span className="text-white font-bold text-sm">ZA</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">ZapAgent AI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-300 hover:scale-105 lg:hidden"
          >
            <X className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
          </Button>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-300 transform hover:scale-105 animate-fade-in ${
                  currentPage === item.id 
                    ? 'bg-brand-green text-white hover:bg-brand-green/90 shadow-lg scale-105' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <item.icon className="h-4 w-4 mr-3 transition-transform duration-300" />
                <span className="transition-all duration-300">{item.name}</span>
              </Button>
            ))}
          </div>
        </nav>
      </div>

      {/* Overlay for mobile with smooth fade */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ease-in-out animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center py-4 md:py-6">
              <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                {/* Menu Button with enhanced animation */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSidebar}
                  className="flex items-center space-x-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  <div className="transition-transform duration-300 ease-in-out">
                    {sidebarOpen ? (
                      <X className="h-4 w-4 animate-fade-in" />
                    ) : (
                      <Menu className="h-4 w-4 animate-fade-in" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm transition-all duration-300">
                    {sidebarOpen ? t('userDashboard.close') : t('userDashboard.menu')}
                  </span>
                </Button>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate transition-all duration-300">
                    {menuItems.find(item => item.id === currentPage)?.name || 'Dashboard'}
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block transition-colors duration-300">
                    {currentPage === 'dashboard' && t('userDashboard.mainPanel')}
                    {currentPage === 'metrics' && t('userDashboard.performanceAnalysis')}
                    {currentPage === 'message-generator' && t('userDashboard.aiForProfessionalMessages')}
                  </p>
                </div>
              </div>
              
              {/* Desktop Header Content */}
              <div className="hidden lg:flex items-center space-x-6">
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
                    className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${verifyingSubscription ? 'animate-spin' : ''}`} />
                    {verifyingSubscription ? t('userDashboard.verifying') : t('userDashboard.verifyPlan')}
                  </Button>
                  {shouldShowUpgradeButton() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUpgradeModal(true)}
                      className="text-brand-green border-brand-green/30 hover:bg-brand-green hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      {getUpgradeButtonText()}
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden xl:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('userDashboard.welcome')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <ProfileMenu />
                </div>
              </div>

              {/* Mobile Header Content */}
              <div className="lg:hidden flex items-center space-x-2">
                <Badge className={`${getPlanBadgeColor(subscription?.plan_type || 'free')} font-semibold px-2 py-1 text-xs shadow-sm`}>
                  {getPlanDisplayName(subscription?.plan_type || 'free').substring(0, 4)}
                </Badge>
                
                {/* Botões Mobile - Verificar e Upgrade */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={verifySubscription}
                    disabled={verifyingSubscription}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 transition-all duration-300 px-2 py-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${verifyingSubscription ? 'animate-spin' : ''}`} />
                  </Button>
                  {shouldShowUpgradeButton() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUpgradeModal(true)}
                      className="text-brand-green border-brand-green/30 hover:bg-brand-green hover:text-white transition-all duration-300 px-2 py-1"
                    >
                      <Crown className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <ProfileMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {renderCurrentPage()}
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

        <SupportNotifications />
      </div>
    </div>
  );
};

export default Dashboard;
