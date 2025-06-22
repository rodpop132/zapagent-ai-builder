
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, RefreshCw, MessageCircle, Lightbulb, Zap } from 'lucide-react';
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
    
    // Simulação de geração de mensagem (aqui você implementaria a chamada para a IA)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Exemplo de resposta gerada
    const responses = {
      professional: {
        response: `Olá! Obrigado pelo seu contato. Em relação à sua solicitação, terei o prazer em ajudá-lo. Permita-me esclarecer todas as suas dúvidas de forma detalhada para que possamos oferecer a melhor solução para suas necessidades.`,
        'follow-up': `Espero que esteja bem! Gostaria de dar seguimento ao nosso último contato. Ficou alguma dúvida pendente que eu possa esclarecer? Estou à disposição para ajudá-lo com qualquer informação adicional que precise.`,
        sales: `Fico feliz com seu interesse! Temos excelentes opções que certamente atenderão suas expectativas. Gostaria de apresentar algumas alternativas especiais que preparei especificamente para seu perfil. Quando seria um bom momento para conversarmos?`,
        support: `Compreendo sua situação e estou aqui para ajudar. Vou analisar cuidadosamente sua solicitação e providenciar uma solução adequada. Pode contar com nosso suporte completo para resolver esta questão da melhor forma possível.`
      },
      friendly: {
        response: `Oi! Que bom falar com você! 😊 Vi sua mensagem e vou te ajudar com muito prazer. Deixa eu te explicar tudo direitinho para esclarecer suas dúvidas, ok?`,
        'follow-up': `Oi! Tudo bem? Queria saber como você está e se consegui te ajudar direito da última vez. Se tiver mais alguma coisa que eu possa fazer por você, é só falar! 😄`,
        sales: `Que legal que você se interessou! 🎉 Tenho certeza que temos o que você está procurando. Preparei algumas opções incríveis que acho que você vai amar. Quer que eu te conte mais sobre elas?`,
        support: `Oi! Entendi seu problema e vou te ajudar a resolver isso rapidinho! 💪 Pode ficar tranquilo que vamos encontrar a melhor solução juntos. Conte comigo!`
      }
    };

    const currentTone = selectedTone as keyof typeof responses;
    const currentType = selectedType as keyof typeof responses[typeof currentTone];
    
    setGeneratedMessage(responses[currentTone]?.[currentType] || responses.professional.response);
    setIsGenerating(false);
    toast.success('Mensagem gerada com sucesso!');
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast.success('Mensagem copiada para a área de transferência!');
  };

  const useExample = (message: string) => {
    setClientMessage(message);
  };

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gerador de Mensagens com IA</h1>
        <p className="text-gray-600 dark:text-gray-400">Crie respostas profissionais e personalizadas para seus clientes</p>
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
                onChange={(e) => setClientMessage(e.target.value)}
                rows={4}
                className="w-full"
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Resposta Gerada
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
