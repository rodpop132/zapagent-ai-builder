
import { useState } from 'react';
import { MessageCircle, X, Whatsapp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const WHATSAPP_SUPPORT_LINK = "https://wa.link/d3ebbb";

const SupportWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false); // shows modal form
  const [showOptions, setShowOptions] = useState(false); // shows selection buttons
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast.error(t('support.fillAllFields'));
      return;
    }

    setLoading(true);

    try {
      // Simular envio de mensagem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('support.successMessage'));
      setName('');
      setEmail('');
      setMessage('');
      setIsOpen(false);
      setShowOptions(false);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(t('support.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  // Fecha tudo
  const closeAll = () => {
    setIsOpen(false);
    setShowOptions(false);
  };

  return (
    <>
      {/* Botão flutuante */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <Button
          onClick={() => setShowOptions(true)}
          size="lg"
          className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-green-600 hover:bg-green-700 shadow-lg"
          aria-label="Abrir suporte"
        >
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </div>

      {/* Popover de opções de suporte */}
      {showOptions && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end md:items-center justify-center p-2 md:p-4">
          <div className="w-full max-w-xs md:max-w-sm bg-white rounded-t-2xl md:rounded-xl shadow-lg mx-auto flex flex-col items-center gap-3 p-5 animate-in fade-in-0 slide-in-from-bottom-6 md:slide-in-from-top-6">
            <button
              aria-label="Fechar"
              onClick={closeAll}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 bg-white rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg md:text-xl mb-2 text-brand-dark">{t('support.title')}</span>
            <p className="text-brand-gray text-sm mb-1 text-center max-w-xs">{t('support.chooseChannel') || 'Como deseja ser atendido?'}</p>
            <div className="flex flex-col w-full gap-2 mt-2">
              <Button 
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-base py-2 rounded-lg transition"
                onClick={() => {
                  window.open(WHATSAPP_SUPPORT_LINK, '_blank', 'noopener,noreferrer');
                  setShowOptions(false);
                }}
                aria-label="Suporte pelo WhatsApp"
              >
                <Whatsapp className="w-5 h-5" />
                WhatsApp
              </Button>
              <Button 
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-brand-dark text-base py-2 rounded-lg transition"
                onClick={() => {
                  setShowOptions(false);
                  setIsOpen(true);
                }}
                aria-label="Suporte pelo site"
              >
                <MessageCircle className="w-5 h-5 text-brand-dark" />
                {t('support.bySite') || 'Suporte pelo Site'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suporte por formulário */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base md:text-lg">{t('support.title')}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeAll}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    {t('support.name')}
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('support.namePlaceholder')}
                    required
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    {t('support.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('support.emailPlaceholder')}
                    required
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    {t('support.message')}
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('support.messagePlaceholder')}
                    rows={4}
                    required
                    className="text-sm resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-sm"
                  disabled={loading}
                >
                  {loading ? t('support.sending') : t('support.sendButton')}
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

