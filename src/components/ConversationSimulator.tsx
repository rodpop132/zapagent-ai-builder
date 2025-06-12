
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, MessageCircle, User, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ConversationSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConversationSimulator = ({ isOpen, onClose }: ConversationSimulatorProps) => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const scenarios = {
    pt: {
      initial: "Olá! Escolha seu idioma preferido:",
      languages: [
        { code: 'pt', name: 'Português' },
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' }
      ],
      conversation: [
        {
          bot: "Olá! Bem-vindo à nossa loja! 👋 Como posso ajudá-lo hoje?",
          options: [
            { text: "Quero informações sobre produtos", next: 1 },
            { text: "Preciso de suporte técnico", next: 2 }
          ]
        },
        {
          bot: "Ótimo! Temos várias categorias disponíveis. O que você está procurando?",
          options: [
            { text: "Eletrônicos", next: 3 },
            { text: "Roupas", next: 4 }
          ]
        },
        {
          bot: "Entendo que você precisa de suporte. Pode me descrever o problema?",
          options: [
            { text: "Problema com pedido", next: 5 },
            { text: "Dúvida sobre produto", next: 6 }
          ]
        },
        {
          bot: "📱 Nossos eletrônicos estão com 20% de desconto! Smartphones, notebooks e mais. Gostaria de ver algum específico?",
          options: [
            { text: "Ver smartphones", next: 7 },
            { text: "Falar com vendedor", next: 8 }
          ]
        },
        {
          bot: "👗 Nossa coleção de roupas está incrível! Temos peças para todas as ocasiões. Qual seu estilo?",
          options: [
            { text: "Casual", next: 9 },
            { text: "Formal", next: 10 }
          ]
        },
        {
          bot: "Vou ajudar com seu pedido! Pode me informar o número do pedido?",
          options: [
            { text: "Pedido #12345", next: 11 },
            { text: "Não tenho o número", next: 12 }
          ]
        },
        {
          bot: "Claro! Sobre qual produto você tem dúvidas? Posso fornecer especificações técnicas e detalhes.",
          options: [
            { text: "iPhone 15", next: 13 },
            { text: "Notebook Dell", next: 14 }
          ]
        },
        {
          bot: "📱 iPhone 15 - 128GB por R$ 4.799 (à vista) ou 12x R$ 449. Câmera de 48MP, chip A17. Interessado?",
          options: [
            { text: "Quero comprar!", next: 15 },
            { text: "Ver mais opções", next: 16 }
          ]
        },
        {
          bot: "Perfeito! Vou te conectar com um de nossos vendedores especialistas. Aguarde um momento... 👨‍💼",
          options: [
            { text: "Ok, aguardo", next: 17 }
          ]
        },
        {
          bot: "💼 Roupas casuais: temos camisetas, jeans, tênis e acessórios. Tudo com ótimos preços!",
          options: [
            { text: "Ver promoções", next: 18 }
          ]
        },
        {
          bot: "🤵 Trajes formais: ternos, camisas sociais, sapatos de couro. Perfeito para trabalho e eventos!",
          options: [
            { text: "Preciso de um terno", next: 19 }
          ]
        },
        {
          bot: "Encontrei seu pedido #12345! Status: Em transporte. Previsão de entrega: amanhã às 14h. 📦",
          options: [
            { text: "Ótimo, obrigado!", next: 20 }
          ]
        },
        {
          bot: "Sem problemas! Você pode encontrar o número do pedido no email de confirmação ou no WhatsApp da compra.",
          options: [
            { text: "Vou procurar", next: 21 }
          ]
        },
        {
          bot: "📱 iPhone 15: Tela 6.1\", chip A17 Pro, câmera 48MP, 5G, resistente à água. Bateria dura o dia todo!",
          options: [
            { text: "Tem outras cores?", next: 22 }
          ]
        },
        {
          bot: "💻 Notebook Dell Inspiron: Intel i7, 16GB RAM, SSD 512GB, tela 15.6\". Ideal para trabalho e estudos!",
          options: [
            { text: "Qual o preço?", next: 23 }
          ]
        },
        {
          bot: "🎉 Excelente escolha! Vou te enviar o link para pagamento. Parcelamos em até 12x sem juros!",
          options: [
            { text: "Envie o link", next: 24 }
          ]
        },
        {
          bot: "📱 Temos também: Samsung Galaxy S24, Xiaomi 14, iPhone 14. Todos com garantia e frete grátis!",
          options: [
            { text: "Ver Galaxy S24", next: 25 }
          ]
        },
        {
          bot: "👨‍💼 João, nosso especialista, já está sendo notificado. Ele te atenderá em instantes!",
          options: [
            { text: "Perfeito!", next: 26 }
          ]
        },
        {
          bot: "🔥 PROMOÇÃO: Camisetas a partir de R$ 29,90! Jeans por R$ 89,90! Frete grátis acima de R$ 149!",
          options: [
            { text: "Quero aproveitar!", next: 27 }
          ]
        },
        {
          bot: "👔 Temos ternos slim e tradicionais, R$ 299 a R$ 599. Inclui calça e paletó. Qual seu tamanho?",
          options: [
            { text: "Tamanho M", next: 28 }
          ]
        },
        {
          bot: "😊 De nada! Qualquer dúvida, é só chamar. Tenha um ótimo dia!",
          options: [
            { text: "Reiniciar conversa", next: -1 }
          ]
        }
      ]
    },
    en: {
      initial: "Hello! Choose your preferred language:",
      languages: [
        { code: 'en', name: 'English' },
        { code: 'pt', name: 'Português' },
        { code: 'es', name: 'Español' }
      ],
      conversation: [
        {
          bot: "Hello! Welcome to our store! 👋 How can I help you today?",
          options: [
            { text: "Product information", next: 1 },
            { text: "Technical support", next: 2 }
          ]
        }
      ]
    },
    es: {
      initial: "¡Hola! Elige tu idioma preferido:",
      languages: [
        { code: 'es', name: 'Español' },
        { code: 'pt', name: 'Português' },
        { code: 'en', name: 'English' }
      ],
      conversation: [
        {
          bot: "¡Hola! ¡Bienvenido a nuestra tienda! 👋 ¿Cómo puedo ayudarte hoy?",
          options: [
            { text: "Información de productos", next: 1 },
            { text: "Soporte técnico", next: 2 }
          ]
        }
      ]
    }
  };

  const currentScenario = scenarios[i18n.language as keyof typeof scenarios] || scenarios.pt;

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    addMessage(`Idioma selecionado: ${langCode === 'pt' ? 'Português' : langCode === 'en' ? 'English' : 'Español'}`, 'user');
    
    setTimeout(() => {
      addMessage(currentScenario.conversation[0].bot, 'bot');
      setCurrentStep(0);
    }, 500);
  };

  const handleOptionSelect = (option: { text: string; next: number }) => {
    addMessage(option.text, 'user');
    
    setTimeout(() => {
      if (option.next === -1) {
        // Reiniciar conversa
        setMessages([]);
        setCurrentStep(0);
        setSelectedLanguage('');
        return;
      }

      const nextMessage = currentScenario.conversation[option.next];
      if (nextMessage) {
        addMessage(nextMessage.bot, 'bot');
        setCurrentStep(option.next);
      }
    }, 800);
  };

  const resetSimulation = () => {
    setMessages([]);
    setCurrentStep(0);
    setSelectedLanguage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-brand-green text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">ZapAgent Simulator</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-0">
          {!selectedLanguage ? (
            // Language selection
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">{currentScenario.initial}</h3>
              <div className="space-y-3">
                {currentScenario.languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="outline"
                    onClick={() => handleLanguageSelect(lang.code)}
                    className="w-full"
                  >
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            // Chat interface
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-brand-green text-white'
                      }`}>
                        {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Options */}
              {currentScenario.conversation[currentStep]?.options && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="space-y-2">
                    {currentScenario.conversation[currentStep].options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleOptionSelect(option)}
                        className="w-full text-sm justify-start"
                      >
                        {option.text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            onClick={resetSimulation}
            className="w-full text-sm"
          >
            🔄 Reiniciar Simulação
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConversationSimulator;
