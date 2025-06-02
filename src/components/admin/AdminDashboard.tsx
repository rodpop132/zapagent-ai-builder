
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import UserDetailsModal from './UserDetailsModal';
import PasswordRevealModal from './PasswordRevealModal';
import { Eye, LogOut, DollarSign, Wallet, RefreshCw, Menu, CheckCircle, XCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  phone: string;
  created_at: string;
  subscription?: {
    plan_type: string;
    status: string;
  };
}

interface AccessRequest {
  id: string;
  email: string;
  status: string;
  requested_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordRevealUser, setPasswordRevealUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [financialData] = useState({
    totalReceived: 0.00,
    availableWithdraw: 0.00
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Carregando dados do dashboard admin...');
      await Promise.all([loadUsers(), loadAccessRequests()]);
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Buscando usuários registrados...');
      
      // Buscar diretamente da tabela profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          subscriptions (
            plan_type,
            status
          )
        `);

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        
        // Fallback: buscar usuários via auth admin
        try {
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.error('Erro ao buscar usuários auth:', authError);
            return;
          }

          const transformedUsers = authUsers.users.map(user => ({
            id: user.id,
            email: user.email || 'N/A',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'N/A',
            company_name: user.user_metadata?.company_name || 'N/A',
            phone: user.user_metadata?.phone || user.phone || 'N/A',
            created_at: user.created_at,
            subscription: {
              plan_type: 'free',
              status: 'active'
            }
          }));
          
          setUsers(transformedUsers);
          console.log('Usuários carregados via auth:', transformedUsers.length);
        } catch (authError) {
          console.error('Erro crítico ao carregar usuários:', authError);
        }
      } else {
        setUsers(profilesData || []);
        console.log('Profiles carregados:', profilesData?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadAccessRequests = async () => {
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('admin_access_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (requestsError) {
        console.error('Erro ao carregar solicitações:', requestsError);
      } else {
        setAccessRequests(requestsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('admin_access_requests')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Solicitação aprovada!');
      loadAccessRequests();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast.error('Erro ao aprovar solicitação');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('admin_access_requests')
        .update({ 
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Solicitação rejeitada!');
      loadAccessRequests();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Dados atualizados!');
  };

  const handlePasswordReveal = (user: User) => {
    setPasswordRevealUser(user);
    setShowPasswordModal(true);
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      onLogout();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Carregando dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsivo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
            Painel Administrativo
          </h1>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="sm:hidden flex-1">
              <Button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Menu className="w-4 h-4" />
                Menu
              </Button>
            </div>
            
            {/* Desktop Buttons */}
            <div className="hidden sm:flex gap-2">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        )}

        {/* Métricas Financeiras - Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Recebido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(financialData.totalReceived)}
              </div>
              <p className="text-xs text-muted-foreground">
                SaaS ainda não lançado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponível para Saque</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {formatCurrency(financialData.availableWithdraw)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pronto para transferência
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Solicitações de Acesso Pendentes */}
        {accessRequests.length > 0 && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Solicitações de Acesso Pendentes ({accessRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessRequests.map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-yellow-50 rounded-lg gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{request.email}</p>
                      <p className="text-sm text-gray-500">
                        Solicitado em {formatDate(request.requested_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 sm:flex-none hover:bg-green-50 hover:text-green-600"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="flex-1 sm:flex-none"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status do Sistema */}
        <Card className="mb-6 sm:mb-8 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-600 text-base sm:text-lg">
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center sm:text-left">
                <p className="font-medium">Usuários Registrados:</p>
                <p className="text-lg font-bold text-blue-600">{users.length}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-medium">Solicitações Pendentes:</p>
                <p className="text-lg font-bold text-yellow-600">{accessRequests.length}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-medium">Status Stripe:</p>
                <p className="text-lg font-bold text-gray-600">Não Configurado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Usuários Registrados ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum usuário encontrado</p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Recarregar
                </Button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-0">
                {/* Mobile Cards */}
                <div className="sm:hidden space-y-4">
                  {users.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{user.full_name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <Badge className={getPlanColor(user.subscription?.plan_type || 'free')}>
                            {user.subscription?.plan_type || 'free'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Senha:</span>
                          <span className="text-gray-400">••••••••</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePasswordReveal(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Registrado: {formatDate(user.created_at)}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                          className="w-full"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Nome</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Senha</th>
                        <th className="text-left p-3">Plano</th>
                        <th className="text-left p-3">Registrado</th>
                        <th className="text-left p-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr 
                          key={user.id} 
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUser(user)}
                        >
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{user.full_name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{user.company_name || 'Sem empresa'}</p>
                            </div>
                          </td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">••••••••</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePasswordReveal(user);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={getPlanColor(user.subscription?.plan_type || 'free')}>
                              {user.subscription?.plan_type || 'free'}
                            </Badge>
                          </td>
                          <td className="p-3 text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                              }}
                            >
                              Detalhes
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gerenciamento de Staff */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Gerenciar Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StaffManagement />
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {passwordRevealUser && (
        <PasswordRevealModal
          user={passwordRevealUser}
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordRevealUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
