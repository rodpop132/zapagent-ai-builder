
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Settings, MessageSquare } from 'lucide-react';

const AgentsSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Agentes</h1>
          <p className="text-gray-600 mt-2">Gerencie todos os seus agentes ZapAgent</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Agente
        </Button>
      </div>

      {/* Estatísticas dos Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Agentes criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Ativos</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Conectados ao WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Mensagens processadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agentes */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Agentes</CardTitle>
          <CardDescription>
            Lista de todos os agentes criados em sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agente criado</h3>
            <p className="text-gray-600 mb-6">
              Crie seu primeiro agente para começar a automatizar suas conversas no WhatsApp
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Agente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentsSection;
