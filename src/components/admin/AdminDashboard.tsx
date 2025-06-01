
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import UserDetailsModal from './UserDetailsModal';
import PasswordRevealModal from './PasswordRevealModal';
import { Eye, LogOut, DollarSign, Wallet } from 'lucide-react';

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

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordRevealUser, setPasswordRevealUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Dados financeiros mockados (integração Stripe seria implementada aqui)
  const [financialData] = useState({
    totalReceived: 25430.50,
    availableWithdraw: 18200.30
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('📊 Carregando dados do dashboard admin...');
      
      // Carregar usuários
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
        console.error('❌ Erro ao carregar usuários:', profilesError);
        toast.error('Erro ao carregar usuários');
      } else {
        console.log('✅ Usuários carregados:', profilesData);
        setUsers(profilesData || []);
      }

      // Carregar solicitações de acesso
      const { data: requestsData, error: requestsError } = await supabase
        .from('admin_access_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (requestsError) {
        console.error('❌ Erro ao carregar solicitações:', requestsError);
      } else {
        console.log('✅ Solicitações carregadas:', requestsData);
        setAccessRequests(requestsData || []);
      }

    } catch (error) {
      console.error('❌ Erro geral ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReveal = (user: User) => {
    setPasswordRevealUser(user);
    setShowPasswordModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🔧 Painel Administrativo</h1>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        {/* Métricas Financeiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Recebido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(financialData.totalReceived)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de vendas processadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponível para Saque</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>📋 Solicitações de Acesso Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">{request.email}</p>
                      <p className="text-sm text-gray-500">
                        Solicitado em {formatDate(request.requested_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Aprovar
                      </Button>
                      <Button size="sm" variant="destructive">
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>👥 Usuários Registrados ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">IP</th>
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
                      <td className="p-3 text-gray-500">192.168.1.1</td>
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
