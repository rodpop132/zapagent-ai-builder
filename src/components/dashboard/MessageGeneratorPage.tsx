import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, RefreshCw, MessageCircle, Lightbulb, Zap, Crown, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIMessagesUsage } from '@/hooks/useAIMessagesUsage';

const MessageGeneratorPage = () => {
  const [clientMessage, setClientMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedType, setSelectedType] = useState('response');
  const [showExamples, setShowExamples] = useState(false);
  
  const { usage, loading: usageLoading, incrementUsage } = useAIMessagesUsage();

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
    <div className="space-y-4 md:space-y-8 px-2 md:px-0">
      {/* Título - Mobile Otimizado */}
      <div className="text-center md:text-left">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
          Gerador de Mensagens com IA
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Crie respostas profissionais e personalizadas para seus clientes
        </p>
        
        {/* Contador de Uso */}
        <div className="mt-2 md:mt-4">
          <Badge variant="outline" className={`${getUsageColor()} text-xs md:text-sm`}>
            Mensagens geradas: {getUsageDisplay()}
          </Badge>
        </div>
      </div>

      {/* Aviso de Limite */}
      {usage && !usage.can_generate && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Limite de mensagens atingido
                </p>
                <p className="text-xs text-red-600 dark:text-red-300">
                  Você atingiu o limite de {usage.messages_limit} mensagens do seu plano. Faça upgrade para continuar gerando.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout responsivo - Stack no mobile, Grid no desktop */}
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-3 md:gap-6 lg:gap-8">
        
        {/* Configurações - Mobile: Cards compactos lado a lado */}
        <div className="space-y-3 md:space-y-6 lg:col-span-1">
          
          {/* Tom da Mensagem - Mobile: Grid 2x2 */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Tom da Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
              {tones.map((tone) => (
                <Button
                  key={tone.id}
                  variant={selectedTone === tone.id ? "default" : "outline"}
                  className={`w-full justify-start text-xs md:text-sm py-2 md:py-2.5 h-auto transition-all duration-200 hover:scale-105 ${
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

          {/* Tipo de Mensagem - Mobile: Grid 2x2 com ícones */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Tipo de Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
              {messageTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  className={`w-full justify-start text-xs md:text-sm py-2 md:py-2.5 h-auto transition-all duration-200 hover:scale-105 ${
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

          {/* Exemplos - Mobile: Dropdown colapsável com animação */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg">Exemplos</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExamples(!showExamples)}
                  className="md:hidden h-6 w-6 p-0 transition-transform duration-200"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showExamples ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className={`space-y-2 transition-all duration-300 overflow-hidden ${
              showExamples ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } md:max-h-none md:opacity-100`}>
              {exampleMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full text-left text-xs md:text-sm p-2 h-auto whitespace-normal justify-start leading-relaxed transition-all duration-200 hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => useExample(message)}
                >
                  <span className="text-left">"{message}"</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Área Principal - Mobile: Full width */}
        <div className="space-y-4 md:space-y-6 lg:col-span-2">
          
          {/* Input da Mensagem do Cliente */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Mensagem do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Cole aqui a mensagem que o cliente enviou..."
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value.slice(0, 500))}
                rows={3}
                className="w-full text-sm md:text-base resize-none transition-all duration-200 focus:scale-[1.02]"
                maxLength={500}
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 space-y-2 sm:space-y-0">
                <p className="text-xs md:text-sm text-gray-500">
                  {clientMessage.length}/500 caracteres
                </p>
                <Button
                  onClick={generateMessage}
                  disabled={isGenerating || !clientMessage.trim() || !usage?.can_generate}
                  className="bg-brand-green hover:bg-brand-green/90 w-full sm:w-auto text-sm md:text-base transition-all duration-200 hover:scale-105"
                  size={window.innerWidth < 768 ? "default" : "default"}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Resposta
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mensagem Gerada */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                <CardTitle className="text-base md:text-lg">Resposta Gerada pela IA</CardTitle>
                {generatedMessage && (
                  <div className="flex flex-wrap items-center gap-2">
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
                <div className="space-y-4 animate-in fade-in-50 duration-500">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 md:p-4 border">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                      {generatedMessage}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button
                      onClick={copyMessage}
                      variant="outline"
                      className="flex-1 text-sm transition-all duration-200 hover:scale-105"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Mensagem
                    </Button>
                    <Button
                      onClick={generateMessage}
                      variant="outline"
                      disabled={isGenerating || !usage?.can_generate}
                      className="sm:w-auto text-sm transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="sm:hidden ml-2">Gerar Novamente</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 opacity-50" />
                  <p className="text-sm md:text-base">Sua mensagem profissional aparecerá aqui</p>
                  <p className="text-xs md:text-sm mt-1 md:mt-2">Insira a mensagem do cliente e clique em "Gerar Resposta"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Reminder - Mobile: Compacto */}
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700 shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start space-x-2 md:space-x-3">
                <Crown className="h-4 w-4 md:h-5 md:w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1 md:mb-2 text-sm md:text-base">
                    🔓 Atualize para o plano Pro
                  </h4>
                  <p className="text-xs md:text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                    Gere até 10.000 mensagens/mês com IA e tenha acesso a recursos avançados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start space-x-2 md:space-x-3">
                <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 md:mb-2 text-sm md:text-base">
                    Dicas para melhores resultados:
                  </h4>
                  <ul className="text-xs md:text-sm text-blue-800 dark:text-blue-200 space-y-0.5 md:space-y-1 leading-relaxed">
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
  );
};

export default MessageGeneratorPage;
