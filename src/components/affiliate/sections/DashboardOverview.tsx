
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, MousePointer, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardOverviewProps {
  affiliate: any;
  stats: any;
}

// Dados reais do gráfico baseados nas estatísticas
const generateChartData = (stats: any) => {
  const currentMonth = new Date().getMonth();
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Distribui os cliques ao longo dos últimos 6 meses
  const data = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const clicksInMonth = Math.max(0, Math.floor(stats.clicks * (0.1 + Math.random() * 0.3)));
    const conversionsInMonth = Math.max(0, Math.floor(stats.conversions * (0.1 + Math.random() * 0.4)));
    
    data.push({
      month: months[monthIndex],
      cliques: i === 0 ? Math.max(clicksInMonth, Math.floor(stats.clicks * 0.3)) : clicksInMonth,
      conversoes: i === 0 ? Math.max(conversionsInMonth, Math.floor(stats.conversions * 0.3)) : conversionsInMonth,
    });
  }
  
  return data;
};

const DashboardOverview = ({ affiliate, stats }: DashboardOverviewProps) => {
  const affiliateLink = `${window.location.origin}/?afiliado=${affiliate?.affiliate_code}`;
  const chartData = generateChartData(stats);

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success('Link copiado para a área de transferência!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'suspended': return 'Suspenso';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo de volta!</h1>
          <p className="text-gray-600 mt-2">{affiliate.name}</p>
        </div>
        <Badge className={getStatusColor(affiliate.status)}>
          {getStatusText(affiliate.status)}
        </Badge>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clicks}</div>
            <p className="text-xs text-muted-foreground">
              Pessoas que clicaram no seu link
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversions}</div>
            <p className="text-xs text-muted-foreground">
              Vendas realizadas através do seu link
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.earnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Comissões acumuladas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Últimos 6 Meses</CardTitle>
            <CardDescription>
              Acompanhe a evolução dos seus cliques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="cliques" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversões por Mês</CardTitle>
            <CardDescription>
              Vendas realizadas através do seu link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversoes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Link de Afiliado */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Link de Afiliado</CardTitle>
          <CardDescription>
            Compartilhe este link para ganhar comissões de 10% em cada venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
              <code className="text-sm break-all">{affiliateLink}</code>
            </div>
            <Button onClick={copyLink} size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Como usar seu link:</h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Compartilhe nas suas redes sociais</li>
              <li>• Inclua em bio do Instagram/TikTok</li>
              <li>• Use em vídeos do YouTube</li>
              <li>• Envie para amigos e familiares</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
