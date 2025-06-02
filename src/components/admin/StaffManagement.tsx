
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, UserCheck, Mail } from 'lucide-react';

interface StaffMember {
  id: string;
  email: string;
  user_type: 'staff' | 'admin';
  granted_at: string;
  user_id?: string;
}

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadStaffMembers();
  }, []);

  const loadStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .in('user_type', ['staff', 'admin'])
        .order('granted_at', { ascending: false });

      if (error) throw error;
      setStaffMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar staff:', error);
      toast.error('Erro ao carregar membros da equipe');
    } finally {
      setLoading(false);
    }
  };

  const addStaffMember = async () => {
    if (!newStaffEmail.trim()) return;

    setAdding(true);
    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('email', newStaffEmail.trim())
        .single();

      if (existing) {
        toast.error('Este email já possui permissões');
        setAdding(false);
        return;
      }

      // Tentar encontrar o usuário pelo email
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      let userId = null;
      if (!usersError && users) {
        const user = users.users.find(u => u.email === newStaffEmail.trim());
        userId = user?.id || null;
      }

      // Adicionar permissão
      const { error } = await supabase
        .from('user_permissions')
        .insert({
          email: newStaffEmail.trim(),
          user_type: 'staff',
          user_id: userId
        });

      if (error) throw error;

      toast.success('Membro da equipe adicionado com sucesso!');
      setNewStaffEmail('');
      loadStaffMembers();
    } catch (error) {
      console.error('Erro ao adicionar staff:', error);
      toast.error('Erro ao adicionar membro da equipe');
    } finally {
      setAdding(false);
    }
  };

  const removeStaffMember = async (id: string, email: string) => {
    if (!confirm(`Tem certeza que deseja remover ${email} da equipe?`)) return;

    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Membro removido da equipe');
      loadStaffMembers();
    } catch (error) {
      console.error('Erro ao remover staff:', error);
      toast.error('Erro ao remover membro da equipe');
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'admin': return 'Administrador';
      case 'staff': return 'Staff';
      default: return 'Usuário';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adicionar Staff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Membro da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newStaffEmail}
              onChange={(e) => setNewStaffEmail(e.target.value)}
              placeholder="email@exemplo.com"
              type="email"
              className="flex-1"
            />
            <Button
              onClick={addStaffMember}
              disabled={!newStaffEmail.trim() || adding}
            >
              {adding ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Digite o email da pessoa. Se ela já estiver registrada, receberá as permissões imediatamente.
            Se não estiver registrada, receberá as permissões quando se registrar.
          </p>
        </CardContent>
      </Card>

      {/* Lista de Staff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Membros da Equipe ({staffMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {staffMembers.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Nenhum membro da equipe
              </h3>
              <p className="text-gray-500">
                Adicione membros à equipe usando o formulário acima.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {staffMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{member.email}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getUserTypeColor(member.user_type)}>
                          {getUserTypeLabel(member.user_type)}
                        </Badge>
                        {member.user_id ? (
                          <Badge variant="outline" className="text-green-600">
                            Registrado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600">
                            Pendente
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Adicionado em {new Date(member.granted_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {member.user_type !== 'admin' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeStaffMember(member.id, member.email)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement;
