
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, RefreshCw, MessageCircle, Lightbulb, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';

const MessageGeneratorPage = () => {
  const [clientMessage, setClientMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedType, setSelectedType] = useState('response');

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
        toast.success('Mensagem gerada com sucesso!');
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
  };

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gerador de Mensagens com IA</h1>
        <p className="text-gray-600 dark:text-gray-400">Crie respostas profissionais e personalizadas para seus clientes usando inteligência artificial</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configurações */}
        <div className="space-y-6">
          {/* Tom da Mensagem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tom da Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tones.map((tone) => (
                <Button
                  key={tone.id}
                  variant={selectedTone === tone.id ? "default" : "outline"}
                  className={`w-full justify-start ${
                    selectedTone === tone.id 
                      ? 'bg-brand-green hover:bg-brand-green/90' 
                      : ''
                  }`}
                  onClick={() => setSelectedTone(tone.id)}
                >
                  {tone.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Tipo de Mensagem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipo de Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {messageTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  className={`w-full justify-start ${
                    selectedType === type.id 
                      ? 'bg-brand-green hover:bg-brand-green/90' 
                      : ''
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <type.icon className="h-4 w-4 mr-2" />
                  {type.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Exemplos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exemplos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exampleMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full text-left text-sm p-2 h-auto whitespace-normal justify-start"
                  onClick={() => useExample(message)}
                >
                  "{message}"
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Área Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input da Mensagem do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mensagem do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Cole aqui a mensagem que o cliente enviou..."
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value.slice(0, 500))}
                rows={4}
                className="w-full"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-500">
                  {clientMessage.length}/500 caracteres
                </p>
                <Button
                  onClick={generateMessage}
                  disabled={isGenerating || !clientMessage.trim()}
                  className="bg-brand-green hover:bg-brand-green/90"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando com IA...
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Resposta Gerada pela IA
                {generatedMessage && (
                  <div className="flex items-center space-x-2">
                    <Badge className={tones.find(t => t.id === selectedTone)?.color}>
                      {tones.find(t => t.id === selectedTone)?.label}
                    </Badge>
                    <Badge variant="outline">
                      {messageTypes.find(t => t.id === selectedType)?.label}
                    </Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedMessage ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {generatedMessage}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={copyMessage}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Mensagem
                    </Button>
                    <Button
                      onClick={generateMessage}
                      variant="outline"
                      disabled={isGenerating}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sua mensagem profissional aparecerá aqui</p>
                  <p className="text-sm mt-2">Insira a mensagem do cliente e clique em "Gerar Resposta"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Reminder */}
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">🔓 Atualize para o plano Pro</h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Gere até 10.000 mensagens/mês com IA e tenha acesso a recursos avançados de personalização
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Dicas para melhores resultados:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Forneça o máximo de contexto possível da mensagem do cliente</li>
                    <li>• Escolha o tom adequado para o seu tipo de negócio</li>
                    <li>• Sempre revise a mensagem antes de enviar</li>
                    <li>• Personalize a resposta com informações específicas quando necessário</li>
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
