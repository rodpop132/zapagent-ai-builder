import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, RefreshCw, MessageCircle, Lightbulb, Zap, Crown, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIMessagesUsage } from '@/hooks/useAIMessagesUsage';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

const MessageGeneratorPage = () => {
  const { t } = useTranslation();
  const [clientMessage, setClientMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedType, setSelectedType] = useState('response');
  const [showExamples, setShowExamples] = useState(false);
  
  const { usage, loading: usageLoading, incrementUsage } = useAIMessagesUsage();
  const isMobile = useIsMobile();

  const tones = [
    { id: 'professional', label: t('messageGenerator.tones.professional'), color: 'bg-blue-100 text-blue-700' },
    { id: 'friendly', label: t('messageGenerator.tones.friendly'), color: 'bg-green-100 text-green-700' },
    { id: 'formal', label: t('messageGenerator.tones.formal'), color: 'bg-purple-100 text-purple-700' },
    { id: 'casual', label: t('messageGenerator.tones.casual'), color: 'bg-orange-100 text-orange-700' },
  ];

  const messageTypes = [
    { id: 'response', label: t('messageGenerator.types.response'), icon: MessageCircle },
    { id: 'follow-up', label: t('messageGenerator.types.followUp'), icon: RefreshCw },
    { id: 'sales', label: t('messageGenerator.types.sales'), icon: Zap },
    { id: 'support', label: t('messageGenerator.types.support'), icon: Lightbulb },
  ];

  // Corrigir o problema com exampleMessages - garantir que seja sempre um array
  const getExampleMessages = () => {
    try {
      const messages = t('messageGenerator.exampleMessages', { returnObjects: true });
      if (Array.isArray(messages)) {
        return messages;
      }
      // Se não for array, retornar exemplos padrão
      return [
        "Olá, gostaria de saber mais sobre seus produtos",
        "Qual é o prazo de entrega?",
        "Vocês aceitam cartão de crédito?",
        "Preciso de ajuda com meu pedido"
      ];
    } catch (error) {
      console.error('Erro ao carregar exemplos:', error);
      return [
        "Olá, gostaria de saber mais sobre seus produtos",
        "Qual é o prazo de entrega?",
        "Vocês aceitam cartão de crédito?",
        "Preciso de ajuda com meu pedido"
      ];
    }
  };

  const exampleMessages = getExampleMessages();

  const generateMessage = async () => {
    if (!clientMessage.trim()) {
      toast.error(t('support.fillAllFields'));
      return;
    }

    // Verificar limite antes de gerar
    if (!usage?.can_generate) {
      toast.error(t('messageGenerator.limitWarning', { limit: usage?.messages_limit || 10 }));
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🤖 Enviando para API de IA...', {
        mensagem: clientMessage,
        tom: selectedTone,
        tipo: selectedType
      });

      const response = await fetch('https://ia-resposters-vvp1.onrender.com/gerar-resposta-profissional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensagem: clientMessage.trim(),
          tom: selectedTone,
          tipo: selectedType
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Resposta da IA recebida:', data);

      if (data.resposta) {
        setGeneratedMessage(data.resposta);
        
        // Incrementar contador de uso após sucesso
        const success = await incrementUsage();
        if (success) {
          toast.success(t('support.successMessage'));
        } else {
          toast.warning('Mensagem gerada, mas houve um problema ao atualizar o contador.');
        }
      } else {
        throw new Error('Resposta inválida da API');
      }

    } catch (error) {
      console.error('❌ Erro ao gerar mensagem:', error);
      toast.error(t('support.errorMessage'));
      setGeneratedMessage('');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMessage = () => {
    if (generatedMessage) {
      navigator.clipboard.writeText(generatedMessage);
      toast.success(t('messageGenerator.copyMessage'));
    }
  };

  const useExample = (message: string) => {
    setClientMessage(message);
    setShowExamples(false);
  };

  const getUsageDisplay = () => {
    if (usageLoading || !usage) return t('userDashboard.loading');
    if (usage.messages_limit >= 999999) return '∞';
    return `${usage.messages_generated}/${usage.messages_limit}`;
  };

  const getUsageColor = () => {
    if (!usage) return 'text-gray-500';
    const percentage = usage.messages_generated / usage.messages_limit;
    if (percentage >= 0.9) return 'text-red-600';
    if (percentage >= 0.7) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-3 md:space-y-8 px-1 md:px-0">
      {/* Título - Mobile Otimizado */}
      <div className="text-center md:text-left px-2 md:px-0">
        <h1 className="text-lg md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2 leading-tight">
          {t('messageGenerator.title')}
        </h1>
        <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('messageGenerator.subtitle')}
        </p>
        
        {/* Contador de Uso */}
        <div className="mt-2 md:mt-4">
          <Badge variant="outline" className={`${getUsageColor()} text-xs`}>
            {t('messageGenerator.messagesUsed')}: {getUsageDisplay()}
          </Badge>
        </div>
      </div>

      {/* Aviso de Limite */}
      {usage && !usage.can_generate && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 mx-1 md:mx-0">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 leading-tight">
                  {t('messageGenerator.limitReached')}
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                  {t('messageGenerator.limitWarning', { limit: usage.messages_limit })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout responsivo */}
      <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-3 md:gap-6 lg:gap-8">
        
        {/* Configurações - Mobile: Cards compactos */}
        <div className="space-y-3 md:space-y-6 lg:col-span-1 px-1 md:px-0">
          
          {/* Tom da Mensagem */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-lg">{t('messageGenerator.messageTone')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-1 gap-1.5 md:gap-3">
              {tones.map((tone) => (
                <Button
                  key={tone.id}
                  variant={selectedTone === tone.id ? "default" : "outline"}
                  className={`w-full justify-start text-xs md:text-sm py-1.5 md:py-2.5 h-auto transition-all duration-200 hover:scale-105 ${
                    selectedTone === tone.id 
                      ? 'bg-brand-green hover:bg-brand-green/90' 
                      : ''
                  }`}
                  onClick={() => setSelectedTone(tone.id)}
                >
                  <span className="truncate">{tone.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Tipo de Mensagem */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-lg">{t('messageGenerator.messageType')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-1 gap-1.5 md:gap-3">
              {messageTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  className={`w-full justify-start text-xs md:text-sm py-1.5 md:py-2.5 h-auto transition-all duration-200 hover:scale-105 ${
                    selectedType === type.id 
                      ? 'bg-brand-green hover:bg-brand-green/90' 
                      : ''
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <type.icon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="truncate">{type.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Exemplos */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm md:text-lg">{t('messageGenerator.examples')}</CardTitle>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExamples(!showExamples)}
                    className="h-6 w-6 p-0 transition-transform duration-200"
                  >
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showExamples ? 'rotate-180' : ''}`} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className={`space-y-1.5 transition-all duration-300 overflow-hidden ${
              isMobile ? (showExamples ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0') : 'max-h-none opacity-100'
            }`}>
              {exampleMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full text-left text-xs md:text-sm p-2 h-auto whitespace-normal justify-start leading-relaxed transition-all duration-200 hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => useExample(message)}
                >
                  <span className="text-left break-words">"{message}"</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Área Principal */}
        <div className="space-y-3 md:space-y-6 lg:col-span-2 px-1 md:px-0">
          
          {/* Input da Mensagem do Cliente */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-lg">{t('messageGenerator.clientMessage')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={t('messageGenerator.clientMessagePlaceholder')}
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value.slice(0, 500))}
                rows={isMobile ? 2 : 3}
                className="w-full text-xs md:text-base resize-none transition-all duration-200 focus:scale-[1.02]"
                maxLength={500}
              />
              <div className="flex flex-col space-y-2">
                <p className="text-xs text-gray-500">
                  {t('messageGenerator.charactersCount', { count: clientMessage.length })}
                </p>
                <Button
                  onClick={generateMessage}
                  disabled={isGenerating || !clientMessage.trim() || !usage?.can_generate}
                  className="bg-brand-green hover:bg-brand-green/90 w-full text-xs md:text-base transition-all duration-200 hover:scale-105 py-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-2 animate-spin" />
                      {t('messageGenerator.generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      {t('messageGenerator.generateResponse')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mensagem Gerada */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex flex-col space-y-2">
                <CardTitle className="text-sm md:text-lg">{t('messageGenerator.generatedResponse')}</CardTitle>
                {generatedMessage && (
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge className={`${tones.find(t => t.id === selectedTone)?.color} text-xs`}>
                      {tones.find(t => t.id === selectedTone)?.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {messageTypes.find(t => t.id === selectedType)?.label}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedMessage ? (
                <div className="space-y-3 animate-in fade-in-50 duration-500">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-xs md:text-base leading-relaxed break-words">
                      {generatedMessage}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={copyMessage}
                      variant="outline"
                      className="w-full text-xs md:text-sm transition-all duration-200 hover:scale-105"
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      {t('messageGenerator.copyMessage')}
                    </Button>
                    <Button
                      onClick={generateMessage}
                      variant="outline"
                      disabled={isGenerating || !usage?.can_generate}
                      className="w-full text-xs md:text-sm transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      {t('messageGenerator.generateAgain')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-6 w-6 md:h-12 md:w-12 mx-auto mb-2 md:mb-4 opacity-50" />
                  <p className="text-xs md:text-base">{t('messageGenerator.responseAppearHere')}</p>
                  <p className="text-xs mt-1">{t('messageGenerator.insertClientMessage')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards informativos - Mobile: Compactos */}
          <div className="space-y-3">
            {/* Upgrade Reminder */}
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1 text-xs md:text-base">
                      {t('messageGenerator.upgradeProTitle')}
                    </h4>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                      {t('messageGenerator.upgradeProDescription')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-xs md:text-base">
                      {t('messageGenerator.tipsTitle')}
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5 leading-relaxed">
                      {(t('messageGenerator.tipsList', { returnObjects: true }) as string[]).map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageGeneratorPage;
