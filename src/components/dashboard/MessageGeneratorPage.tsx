
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, RefreshCw, MessageCircle, Lightbulb, Zap, Crown, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIMessagesUsage } from '@/hooks/useAIMessagesUsage';
import { useIsMobile } from '@/hooks/use-mobile';

const MessageGeneratorPage = () => {
  const [clientMessage, setClientMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedType, setSelectedType] = useState('response');
  const [showExamples, setShowExamples] = useState(false);
  
  const { usage, loading: usageLoading, incrementUsage } = useAIMessagesUsage();
  const isMobile = useIsMobile();

  const tones = [
    { id: 'professional', label: 'Profissional', color: 'bg-blue-100 text-blue-700' },
    { id: 'friendly', label: 'Amigável', color: 'bg-green-100 text-green-700' },
    { id: 'formal', label: 'Formal', color: 'bg-purple-100 text-purple-700' },
    { id: 'casual', label: 'Casual', color: 'bg-orange-100 text-orange-700' },
  ];

  const messageTypes = [
    { id: 'response', label: 'Resposta', icon: MessageCircle },
    { id: 'follow-up', label: 'Follow-up', icon: RefreshCw },
    { id: 'sales', label: 'Vendas', icon: Zap },
    { id: 'support', label: 'Suporte', icon: Lightbulb },
  ];

  const exampleMessages = [
    "Oi, gostaria de saber mais sobre seus produtos",
    "Qual é o prazo de entrega para São Paulo?",
    "Vocês fazem desconto para compra em quantidade?",
    "Como funciona a garantia dos produtos?",
    "Preciso cancelar meu pedido",
  ];

  const generateMessage = async () => {
    if (!clientMessage.trim()) {
      toast.error('Por favor, insira a mensagem do cliente');
      return;
    }

    // Verificar limite antes de gerar
    if (!usage?.can_generate) {
      toast.error(`Limite de ${usage?.messages_limit || 10} mensagens atingido. Faça upgrade do seu plano!`);
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🤖 Enviando para API de IA...', {
        mensagem: clientMessage,
        tom: selectedTone,
        tipo: selectedType
      });

      const response = await fetch('https://ia-resposters.onrender.com/gerar-resposta-profissional', {
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
          toast.success('Mensagem gerada com sucesso!');
        } else {
          toast.warning('Mensagem gerada, mas houve um problema ao atualizar o contador.');
        }
      } else {
        throw new Error('Resposta inválida da API');
      }

    } catch (error) {
      console.error('❌ Erro ao gerar mensagem:', error);
      toast.error('❌ Erro ao gerar resposta. Tente novamente.');
      setGeneratedMessage('');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMessage = () => {
    if (generatedMessage) {
      navigator.clipboard.writeText(generatedMessage);
      toast.success('Mensagem copiada para a área de transferência!');
    }
  };

  const useExample = (message: string) => {
    setClientMessage(message);
    setShowExamples(false);
  };

  const getUsageDisplay = () => {
    if (usageLoading || !usage) return 'Carregando...';
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
          Gerador de Mensagens com IA
        </h1>
        <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          Crie respostas profissionais e personalizadas para seus clientes
        </p>
        
        {/* Contador de Uso */}
        <div className="mt-2 md:mt-4">
          <Badge variant="outline" className={`${getUsageColor()} text-xs`}>
            Mensagens: {getUsageDisplay()}
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
                  Limite atingido
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                  Você atingiu o limite de {usage.messages_limit} mensagens. Faça upgrade para continuar.
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
              <CardTitle className="text-sm md:text-lg">Tom da Mensagem</CardTitle>
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
              <CardTitle className="text-sm md:text-lg">Tipo de Mensagem</CardTitle>
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
                <CardTitle className="text-sm md:text-lg">Exemplos</CardTitle>
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
              <CardTitle className="text-sm md:text-lg">Mensagem do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Cole aqui a mensagem que o cliente enviou..."
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value.slice(0, 500))}
                rows={isMobile ? 2 : 3}
                className="w-full text-xs md:text-base resize-none transition-all duration-200 focus:scale-[1.02]"
                maxLength={500}
              />
              <div className="flex flex-col space-y-2">
                <p className="text-xs text-gray-500">
                  {clientMessage.length}/500 caracteres
                </p>
                <Button
                  onClick={generateMessage}
                  disabled={isGenerating || !clientMessage.trim() || !usage?.can_generate}
                  className="bg-brand-green hover:bg-brand-green/90 w-full text-xs md:text-base transition-all duration-200 hover:scale-105 py-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      Gerar Resposta
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
                <CardTitle className="text-sm md:text-lg">Resposta Gerada pela IA</CardTitle>
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
                      Copiar Mensagem
                    </Button>
                    <Button
                      onClick={generateMessage}
                      variant="outline"
                      disabled={isGenerating || !usage?.can_generate}
                      className="w-full text-xs md:text-sm transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      Gerar Novamente
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-6 w-6 md:h-12 md:w-12 mx-auto mb-2 md:mb-4 opacity-50" />
                  <p className="text-xs md:text-base">Sua mensagem profissional aparecerá aqui</p>
                  <p className="text-xs mt-1">Insira a mensagem do cliente e clique em "Gerar Resposta"</p>
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
                      🔓 Atualize para o plano Pro
                    </h4>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                      Gere até 10.000 mensagens/mês com IA e tenha acesso a recursos avançados
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
                      Dicas para melhores resultados:
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5 leading-relaxed">
                      <li>• Forneça o máximo de contexto da mensagem do cliente</li>
                      <li>• Escolha o tom adequado para seu tipo de negócio</li>
                      <li>• Sempre revise a mensagem antes de enviar</li>
                      <li>• Personalize com informações específicas quando necessário</li>
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
