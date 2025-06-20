
import { useState } from 'react';
import { MessageCircle, X, Phone, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

const WHATSAPP_SUPPORT_LINK = "https://wa.link/d3ebbb";

const SupportWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast.error(t('support.fillAllFields'));
      return;
    }

    setLoading(true);

    try {
      console.log('📩 SUPPORT: Salvando ticket no banco...');
      
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || 'Suporte Geral',
          message: message.trim(),
          status: 'open'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ SUPPORT: Erro ao salvar ticket:', error);
        throw error;
      }

      console.log('✅ SUPPORT: Ticket salvo com sucesso:', data?.id);
      
      toast.success(t('support.successMessage'));
      setName('');
      setEmail('');
      setMessage('');
      setSubject('');
      setIsOpen(false);
      setShowOptions(false);
    } catch (error) {
      console.error('❌ SUPPORT: Erro ao enviar mensagem:', error);
      toast.error(t('support.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const closeAll = () => {
    setIsOpen(false);
    setShowOptions(false);
  };

  return (
    <>
      {/* Botão flutuante com gradiente e animações */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Efeito de pulso animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-ping opacity-30"></div>
          
          <Button
            onClick={() => setShowOptions(true)}
            size="lg"
            className="relative w-16 h-16 rounded-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-110 group"
            aria-label="Abrir suporte"
          >
            <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
            
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>
      </div>

      {/* Popover de opções de suporte redesenhado */}
      {showOptions && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div 
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl mx-auto flex flex-col items-center gap-4 p-8 relative overflow-hidden
                     animate-in fade-in-0 slide-in-from-bottom-6 md:slide-in-from-scale-95 duration-300"
          >
            {/* Gradiente de fundo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20"></div>
            
            {/* Botão de fechar elegante */}
            <button
              aria-label="Fechar"
              onClick={closeAll}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Ícone decorativo */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse opacity-30"></div>
            </div>

            <div className="text-center relative z-10">
              <h3 className="font-bold text-2xl mb-2 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {t('support.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Como podemos ajudar você hoje?
              </p>
            </div>

            <div className="flex flex-col w-full gap-3 mt-2 relative z-10">
              <Button 
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-base py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 group"
                onClick={() => {
                  window.open(WHATSAPP_SUPPORT_LINK, '_blank', 'noopener,noreferrer');
                  setShowOptions(false);
                }}
                aria-label="Suporte pelo WhatsApp"
              >
                <Phone className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                WhatsApp
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              <Button 
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-800 text-gray-800 dark:text-gray-200 text-base py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-200 dark:border-gray-700 group"
                onClick={() => {
                  setShowOptions(false);
                  setIsOpen(true);
                }}
                aria-label="Suporte pelo site"
              >
                <Send className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Suporte pelo Site
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suporte por formulário redesenhado */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto relative bg-white dark:bg-gray-900 shadow-2xl border-0 animate-in fade-in-0 scale-in-95 duration-300">
            {/* Gradiente de cabeçalho */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg"></div>
            
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
              <CardTitle className="text-xl text-white font-semibold">
                {t('support.title')}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeAll}
                className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="relative z-10 bg-white dark:bg-gray-900 rounded-t-3xl -mt-4 pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('support.name')}
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('support.namePlaceholder')}
                    required
                    className="text-sm border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('support.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('support.emailPlaceholder')}
                    required
                    className="text-sm border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Assunto
                  </label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Qual é o assunto do seu contato?"
                    className="text-sm border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('support.message')}
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('support.messagePlaceholder')}
                    rows={4}
                    required
                    className="text-sm resize-none border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t('support.sending')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {t('support.sendButton')}
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SupportWidget;
