
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const SupportWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
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
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(t('support.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-green-600 hover:bg-green-700 shadow-lg"
        >
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </div>

      {/* Modal de suporte */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base md:text-lg">{t('support.title')}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
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
