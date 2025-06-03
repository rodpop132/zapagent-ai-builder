
import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    setLoading(true);
    try {
      // Criar ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          subject: subject.trim(),
          status: 'open',
          priority: 'medium'
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Erro ao criar ticket:', ticketError);
        throw ticketError;
      }

      // Criar primeira mensagem
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          user_email: user.email || '',
          message: message.trim(),
          is_staff: false
        });

      if (messageError) {
        console.error('Erro ao criar mensagem:', messageError);
        throw messageError;
      }

      toast.success('Ticket criado com sucesso! Nossa equipe entrará em contato em breve.');
      setSubject('');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      toast.error('Erro ao criar ticket. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Support Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          size="icon"
        >
          {/* Logo customizado */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center mb-0.5 md:mb-1 group-hover:scale-110 transition-transform duration-300">
              <img 
                src="/lovable-uploads/39b28839-0adb-4c96-be58-c66537953b63.png" 
                alt="Support" 
                className="w-4 h-4 md:w-6 md:h-6 object-contain"
              />
            </div>
            <span className="text-[8px] md:text-[10px] text-white font-medium opacity-90">
              Suporte
            </span>
          </div>
          
          {/* Efeito de hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Pulso animado */}
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />
        </Button>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <Card className="w-full max-w-md max-h-[90vh] md:max-h-[80vh] overflow-hidden rounded-t-2xl md:rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/39b28839-0adb-4c96-be58-c66537953b63.png" 
                    alt="Support" 
                    className="w-4 h-4 md:w-6 md:h-6 object-contain"
                  />
                </div>
                <CardTitle className="text-base md:text-lg">Suporte ZapAgent</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-600/50 h-8 w-8 md:h-10 md:w-10 hover:rotate-90 transition-transform duration-300"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 md:p-6 overflow-y-auto">
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  👋 Olá! Como podemos te ajudar hoje? Nossa equipe responde em até 2 horas.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 md:mb-2">
                    Assunto
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Descreva brevemente sua dúvida"
                    required
                    className="focus:ring-green-500 focus:border-green-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 md:mb-2">
                    Mensagem
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva sua dúvida em detalhes..."
                    rows={3}
                    required
                    className="focus:ring-green-500 focus:border-green-500 text-sm md:text-base resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-sm md:text-base"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !subject.trim() || !message.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-sm md:text-base"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <>
                        <Send className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SupportWidget;
