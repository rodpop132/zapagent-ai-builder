
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertTriangle, MessageSquare, Ban, Eye } from 'lucide-react';

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

interface UserActivity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  ip_address: string;
}

interface UserAction {
  id: string;
  action_type: string;
  reason: string;
  admin_note: string;
  active: boolean;
  created_at: string;
  expires_at: string;
}

interface UserDetailsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsModal = ({ user, isOpen, onClose }: UserDetailsModalProps) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [actionType, setActionType] = useState<'warning' | 'suspension' | 'ban' | 'ticket'>('warning');
  const [reason, setReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    try {
      console.log('📊 Carregando dados do usuário:', user.id);

      // Carregar atividades do usuário
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activitiesError) {
        console.error('❌ Erro ao carregar atividades:', activitiesError);
      } else {
        setActivities(activitiesData || []);
      }

      // Carregar ações administrativas
      const { data: actionsData, error: actionsError } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (actionsError) {
        console.error('❌ Erro ao carregar ações:', actionsError);
      } else {
        setUserActions(actionsData || []);
      }

    } catch (error) {
      console.error('❌ Erro geral:', error);
    }
  };

  const handleApplyAction = async () => {
    if (!reason.trim()) {
      toast.error('Digite o motivo da ação');
      return;
    }

    setLoading(true);
    try {
      console.log('⚡ Aplicando ação:', { actionType, reason, adminNote });

      const { error } = await supabase
        .from('user_actions')
        .insert({
          user_id: user.id,
          action_type: actionType,
          reason: reason.trim(),
          admin_note: adminNote.trim() || null,
          expires_at: actionType === 'suspension' ? 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
        });

      if (error) {
        console.error('❌ Erro ao aplicar ação:', error);
        toast.error('Erro ao aplicar ação');
        return;
      }

      console.log('✅ Ação aplicada com sucesso');
      toast.success(`${actionType} aplicado com sucesso!`);
      
      // Limpar formulário
      setReason('');
      setAdminNote('');
      
      // Recarregar dados
      loadUserData();

    } catch (error) {
      console.error('❌ Erro geral:', error);
      toast.error('Erro ao processar ação');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'suspension': return <Ban className="w-4 h-4 text-orange-500" />;
      case 'ban': return <Ban className="w-4 h-4 text-red-500" />;
      case 'ticket': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'suspension': return 'bg-orange-100 text-orange-800';
      case 'ban': return 'bg-red-100 text-red-800';
      case 'ticket': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            👤 Detalhes do Usuário: {user.full_name || user.email}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações do Usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">Email:</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div>
                <p className="font-medium">Nome Completo:</p>
                <p className="text-gray-600">{user.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Empresa:</p>
                <p className="text-gray-600">{user.company_name || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Telefone:</p>
                <p className="text-gray-600">{user.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Plano:</p>
                <Badge className={`${user.subscription?.plan_type === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.subscription?.plan_type || 'free'}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Registrado em:</p>
                <p className="text-gray-600">{formatDate(user.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Aplicar Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Aplicar Ação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Ação:</label>
                <select 
                  value={actionType} 
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="warning">⚠️ Aviso</option>
                  <option value="suspension">🚫 Suspensão (7 dias)</option>
                  <option value="ban">❌ Banimento</option>
                  <option value="ticket">🎫 Ticket/Mensagem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Motivo:</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Digite o motivo da ação..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nota Administrativa (opcional):</label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Notas internas para outros admins..."
                  className="min-h-[60px]"
                />
              </div>

              <Button
                onClick={handleApplyAction}
                disabled={loading || !reason.trim()}
                className="w-full"
              >
                {loading ? 'Aplicando...' : 'Aplicar Ação'}
              </Button>
            </CardContent>
          </Card>

          {/* Histórico de Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📝 Histórico de Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userActions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma ação aplicada</p>
                ) : (
                  userActions.map((action) => (
                    <div key={action.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionIcon(action.action_type)}
                        <Badge className={getActionColor(action.action_type)}>
                          {action.action_type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(action.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{action.reason}</p>
                      {action.admin_note && (
                        <p className="text-xs text-gray-500 mt-1">
                          Nota: {action.admin_note}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Atividades Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔍 Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma atividade registrada</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="text-sm border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{activity.activity_type}</p>
                          <p className="text-gray-600">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                      {activity.ip_address && (
                        <p className="text-xs text-gray-400">IP: {activity.ip_address}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
