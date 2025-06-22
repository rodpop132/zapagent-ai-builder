
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star, CheckCircle, X } from 'lucide-react';

interface SocialProofNotification {
  id: string;
  name: string;
  plan: string;
  location: string;
  planColor: string;
  planIcon: React.ReactNode;
}

const SocialProofNotifications = () => {
  const [currentNotification, setCurrentNotification] = useState<SocialProofNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [notificationIndex, setNotificationIndex] = useState(0);

  const names = [
    'Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Pereira', 'Fernanda Costa',
    'Ricardo Lima', 'Juliana Souza', 'Pedro Almeida', 'Camila Rodrigues', 'Bruno Martins',
    'Larissa Ferreira', 'Thiago Barbosa', 'Gabriela Rocha', 'Mateus Carvalho', 'Beatriz Dias',
    'Leonardo Gomes', 'Mariana Ribeiro', 'Rafael Monteiro', 'Isabela Nascimento', 'André Vieira',
    'Carolina Moreira', 'Daniel Castro', 'Vitória Araújo', 'Gustavo Cardoso', 'Renata Fernandes',
    'Felipe Correia', 'Amanda Teixeira', 'Rodrigo Pinto', 'Patrícia Freitas', 'Lucas Melo',
    'Natália Ramos', 'Marcelo Silva', 'Priscila Campos', 'Vinícius Torres', 'Tatiana Lopes',
    'Fábio Cavalcanti', 'Mônica Azevedo', 'Sérgio Mendes', 'Cristina Nogueira', 'Henrique Pacheco',
    'Vanessa Machado', 'Antônio Rezende', 'Cláudia Cunha', 'Eduardo Brito', 'Simone Coelho',
    'Alexandre Duarte', 'Aline Vasconcellos', 'Robson Farias', 'Luciana Morais', 'Diego Caldeira',
    'Adriana Nunes', 'Wellington Miranda', 'Denise Xavier', 'Márcio Tavares', 'Eliane Batista',
    'César Cordeiro', 'Soraia Porto', 'Everton Siqueira', 'Rosana Medeiros', 'Nelson Figueiredo',
    'Sabrina Moura', 'Guilherme Vaz', 'Luciane Guerra', 'Renan Barreto', 'Kátia Sampaio',
    'Francisco Leal', 'Viviane Gonçalves', 'Otávio Brandão', 'Sandra Aguiar', 'Milton Ribas',
    'Carla Pessoa', 'Edson Amaral', 'Márcia Leite', 'Jaime Castelo', 'Sônia Valle',
    'Leandro Paiva', 'Teresa Evangelista', 'Flávio Borges', 'Regina Guimarães', 'Cláudio Reis',
    'Solange Franco', 'Júlio Bastos', 'Elza Matos', 'Paulo Kramer', 'Vera Godoy',
    'Ronaldo Maia', 'Ângela Sales', 'Mário Caldas', 'Lúcia Antunes', 'Alberto Dantas',
    'Silvia Vargas', 'Wanderson Cruz', 'Elizete Fonseca', 'Raul Esteves', 'Neuza Mesquita',
    'Emerson Veloso', 'Grace Montanha', 'Edmar Silveira', 'Sueli Domingues', 'Ademir Lago',
    'Cristiane Sena', 'Valmir Pedrosa', 'Dalva Magalhães', 'Sebastião Goulart', 'Márcia Prado',
    'Valter Ventura', 'Edna Quadros', 'Ivan Linhares', 'Célia Espírito Santo', 'Benício Alcântara'
  ];

  const locations = [
    'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Salvador, BA', 'Fortaleza, CE',
    'Brasília, DF', 'Curitiba, PR', 'Recife, PE', 'Porto Alegre, RS', 'Manaus, AM',
    'Belém, PA', 'Goiânia, GO', 'Guarulhos, SP', 'Campinas, SP', 'São Luís, MA',
    'São Gonçalo, RJ', 'Maceió, AL', 'Duque de Caxias, RJ', 'Natal, RN', 'Teresina, PI',
    'Campo Grande, MS', 'Nova Iguaçu, RJ', 'São Bernardo do Campo, SP', 'João Pessoa, PB',
    'Santo André, SP', 'Osasco, SP', 'Jaboatão dos Guararapes, PE', 'São José dos Campos, SP',
    'Ribeirão Preto, SP', 'Uberlândia, MG', 'Sorocaba, SP', 'Contagem, MG', 'Aracaju, SE',
    'Feira de Santana, BA', 'Cuiabá, MT', 'Joinville, SC', 'Juiz de Fora, MG', 'Londrina, PR',
    'Aparecida de Goiânia, GO', 'Ananindeua, PA', 'Porto Velho, RO', 'Serra, ES',
    'Niterói, RJ', 'Caxias do Sul, RS', 'Macapá, AP', 'Mogi das Cruzes, SP', 'Vila Velha, ES',
    'Florianópolis, SC', 'Santos, SP', 'Diadema, SP'
  ];

  const plans = [
    { name: 'Grátis', color: 'bg-gray-100 text-gray-700', icon: <Star className="h-4 w-4" /> },
    { name: 'Pro', color: 'bg-blue-100 text-blue-700', icon: <Crown className="h-4 w-4" /> },
    { name: 'Ultra', color: 'bg-purple-100 text-purple-700', icon: <Zap className="h-4 w-4" /> }
  ];

  const generateNotification = (): SocialProofNotification => {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomPlan = plans[Math.floor(Math.random() * plans.length)];
    
    return {
      id: `notification-${Date.now()}-${Math.random()}`,
      name: randomName,
      plan: randomPlan.name,
      location: randomLocation,
      planColor: randomPlan.color,
      planIcon: randomPlan.icon
    };
  };

  useEffect(() => {
    const showNotification = () => {
      const notification = generateNotification();
      setCurrentNotification(notification);
      setIsVisible(true);
      
      // Esconder após 8 segundos
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentNotification(null);
        }, 600); // Aguardar animação de saída
      }, 8000);
    };

    // Mostrar primeira notificação após 5 segundos
    const initialTimer = setTimeout(() => {
      showNotification();
    }, 5000);

    // Mostrar notificações a cada 30 segundos
    const intervalTimer = setInterval(() => {
      showNotification();
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentNotification(null);
    }, 600);
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 left-4 z-40 max-w-sm transition-all duration-700 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100 translate-x-0' 
          : 'opacity-0 translate-y-8 scale-90 -translate-x-4 pointer-events-none'
      }`}
      style={{
        animation: isVisible 
          ? 'slideInLeft 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards, bounceIn 0.3s ease-out 0.4s' 
          : 'slideOutLeft 0.6s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards'
      }}
    >
      <Card className="shadow-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-50 backdrop-blur-md hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                <CheckCircle className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-bold text-gray-900 truncate transition-colors duration-300 group-hover:text-green-700">
                  {currentNotification.name}
                </p>
                <Badge className={`${currentNotification.planColor} text-xs px-2 py-0.5 flex items-center space-x-1 shadow-sm transform transition-all duration-300 group-hover:scale-105`}>
                  {currentNotification.planIcon}
                  <span>{currentNotification.plan}</span>
                </Badge>
              </div>
              
              <p className="text-xs text-gray-700 mb-1 font-medium">
                acabou de assinar o plano <span className="font-bold text-green-600">{currentNotification.plan}</span>
              </p>
              
              <p className="text-xs text-gray-500 flex items-center space-x-1 mb-2">
                <span className="text-orange-500">📍</span>
                <span className="font-medium">{currentNotification.location}</span>
              </p>
              
              <div className="flex items-center space-x-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <span className="text-xs text-green-600 font-bold">Ativo agora</span>
                <div className="flex space-x-0.5 ml-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 transition-all duration-300 rounded-full hover:bg-gray-100 hover:scale-110 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            transform: translateX(-100%) translateY(20px) scale(0.9);
            opacity: 0;
          }
          60% {
            transform: translateX(8px) translateY(0) scale(1.02);
            opacity: 0.9;
          }
          100% {
            transform: translateX(0) translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slideOutLeft {
          0% {
            transform: translateX(0) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%) translateY(-10px) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SocialProofNotifications;
