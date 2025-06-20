
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
    { name: 'Pro', color: 'bg-blue-100 text-blue-700', icon: <Zap className="h-4 w-4" /> },
    { name: 'Ultra', color: 'bg-purple-100 text-purple-700', icon: <Crown className="h-4 w-4" /> },
    { name: 'Premium', color: 'bg-yellow-100 text-yellow-700', icon: <Star className="h-4 w-4" /> }
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
        }, 500); // Aguardar animação de saída
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
    }, 500);
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 max-w-sm transition-all duration-500 ease-in-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <Card className="shadow-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentNotification.name}
                </p>
                <Badge className={`${currentNotification.planColor} text-xs px-2 py-0.5 flex items-center space-x-1`}>
                  {currentNotification.planIcon}
                  <span>{currentNotification.plan}</span>
                </Badge>
              </div>
              
              <p className="text-xs text-gray-700 mb-1">
                acabou de assinar o plano <span className="font-medium">{currentNotification.plan}</span>
              </p>
              
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <span>📍</span>
                <span>{currentNotification.location}</span>
              </p>
              
              <div className="flex items-center space-x-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Ativo agora</span>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProofNotifications;
