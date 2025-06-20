
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { message-square, crown, zap } from 'lucide-react';

const WhatsAppSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Integrado</h1>
          <p className="text-gray-600 mt-2">Conecte diretamente com o WhatsApp oficial</p>
        </div>
        <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
          <crown className="h-3 w-3 mr-1" />
          Recurso PRO
        </Badge>
      </div>

      {/* Card de Upgrade */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <crown className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-orange-900">Upgrade para PRO</CardTitle>
          <CardDescription className="text-orange-700">
            Desbloqueie a integração oficial do WhatsApp e muito mais!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-orange-900">WhatsApp Business API</h4>
                <p className="text-sm text-orange-700">Integração oficial com WhatsApp Business</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-orange-900">Mensagens Ilimitadas</h4>
                <p className="text-sm text-orange-700">Sem limite de mensagens por mês</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-orange-900">Multi-atendentes</h4>
                <p className="text-sm text-orange-700">Vários operadores simultâneos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-orange-900">Relatórios Avançados</h4>
                <p className="text-sm text-orange-700">Analytics detalhados e insights</p>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t border-orange-200">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
              <zap className="h-4 w-4 mr-2" />
              Fazer Upgrade Agora
            </Button>
            <p className="text-sm text-orange-600 mt-2">
              A partir de R$ 97/mês
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recursos Bloqueados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <message-square className="h-5 w-5 mr-2" />
              Conexões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">Disponível apenas no plano PRO</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <chart-bar className="h-5 w-5 mr-2" />
              Métricas WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">Disponível apenas no plano PRO</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppSection;
