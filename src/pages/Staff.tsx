import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageCircle, Send, Clock, CheckCircle, AlertCircle, LogOut, RefreshCw } from 'lucide-react';

interface Ticket {
  id: string;
  user_email: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  message: string;
  user_email: string;
  is_staff: boolean;
  created_at: string;
}

const Staff = () => {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      checkStaffPermissions();
    }
  }, [user]);

  useEffect(() => {
    if (isStaff) {
      loadTickets();
    }
  }, [isStaff]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const checkStaffPermissions = async () => {
    try {
      console.log('🔍 STAFF: Verificando permissões para:', user?.email);
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user?.id)
        .in('user_type', ['staff', 'admin'])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ STAFF: Erro ao verificar permissões:', error);
        setIsStaff(false);
      } else {
        const hasPermission = !!data;
        console.log(hasPermission ? '✅ STAFF: Acesso autorizado' : '🔒 STAFF: Acesso negado');
        setIsStaff(hasPermission);
      }
    } catch (error) {
      console.error('💥 STAFF: Erro crítico:', error);
      setIsStaff(false);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      console.log('🎫 STAFF: Carregando tickets...');
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('✅ STAFF: Tickets carregados:', data?.length || 0);
      setTickets(data || []);
    } catch (error) {
      console.error('❌ STAFF: Erro ao carregar tickets:', error);
      toast.error('Erro ao carregar tickets');
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      console.log('💬 STAFF: Carregando mensagens para ticket:', ticketId);
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('✅ STAFF: Mensagens carregadas:', data?.length || 0);
      setMessages(data || []);
    } catch (error) {
      console.error('❌ STAFF: Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      console.log('📤 STAFF: Enviando mensagem...');
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user?.id,
          user_email: user?.email || '',
          message: newMessage.trim(),
          is_staff: true
        });

      if (error) throw error;

      // Atualizar status do ticket para 'answered' se ainda estiver 'open'
      if (selectedTicket.status === 'open') {
        await supabase
          .from('tickets')
          .update({ 
            status: 'answered',
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTicket.id);
      }

      setNewMessage('');
      loadMessages(selectedTicket.id);
      loadTickets();
      console.log('✅ STAFF: Mensagem enviada');
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('❌ STAFF: Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      console.log('🔄 STAFF: Atualizando status do ticket:', ticketId, 'para:', newStatus);
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      loadTickets();
      console.log('✅ STAFF: Status atualizado');
      toast.success('Status do ticket atualizado!');
    } catch (error) {
      console.error('❌ STAFF: Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do ticket');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'answered': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'answered': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'answered': return 'Respondido';
      case 'closed': return 'Fechado';
      default: return 'Desconhecido';
    }
  };

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      console.log('🚪 STAFF: Fazendo logout...');
      await signOut();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar o painel de staff.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Painel Staff - Tickets</h1>
          <div className="flex gap-2">
            <Button 
              onClick={loadTickets}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Lista de Tickets */}
        <div className="w-1/3 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Tickets ({tickets.length})</h2>
          </div>
          
          <div className="space-y-2 p-4">
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum ticket encontrado</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <Card 
                  key={ticket.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm truncate pr-2">
                        {ticket.subject}
                      </h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          {getStatusLabel(ticket.status)}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{ticket.user_email}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(ticket.created_at)}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Chat do Ticket */}
        <div className="flex-1 flex flex-col">
          {selectedTicket ? (
            <>
              {/* Header do Chat */}
              <div className="bg-white border-b p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold">{selectedTicket.subject}</h2>
                    <p className="text-sm text-gray-500">{selectedTicket.user_email}</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="open">Aberto</option>
                      <option value="answered">Respondido</option>
                      <option value="closed">Fechado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_staff ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.is_staff
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.is_staff ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {message.is_staff ? 'Staff' : message.user_email} • {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input de Mensagem */}
              <div className="bg-white border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua resposta..."
                    rows={2}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Selecione um ticket
                </h3>
                <p className="text-gray-500">
                  Escolha um ticket da lista para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Staff;
