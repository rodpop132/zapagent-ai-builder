
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, MessageCircle, Bot, Activity } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

interface GlobalUsageData {
  totalMessagesUsed: number;
  activeAgents: number;
  agentsCount: number;
}

interface Subscription {
  plan_type: string;
  messages_used: number;
  messages_limit: number;
  status: string;
  is_unlimited?: boolean;
}

interface MetricsPageProps {
  agents: Agent[];
  globalUsage: GlobalUsageData | null;
  subscription: Subscription | null;
}

const MetricsPage = ({ agents, globalUsage, subscription }: MetricsPageProps) => {
  // Dados simulados para demonstração
  const generateDailyData = () => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return days.map(day => ({
      day,
      messages: Math.floor(Math.random() * 50) + 10,
      responses: Math.floor(Math.random() * 45) + 8,
    }));
  };

  const generateAgentData = () => {
    return agents.slice(0, 5).map(agent => ({
      name: agent.name.length > 15 ? agent.name.substring(0, 15) + '...' : agent.name,
      messages: Math.floor(Math.random() * 200) + 50,
      conversions: Math.floor(Math.random() * 20) + 5,
    }));
  };

  const generatePieData = () => [
    { name: 'Mensagens Respondidas', value: 85, color: '#10B981' },
    { name: 'Aguardando Resposta', value: 15, color: '#F59E0B' },
  ];

  const dailyData = generateDailyData();
  const agentData = generateAgentData();
  const pieData = generatePieData();

  const stats = [
    {
      title: 'Total de Mensagens',
      value: globalUsage?.totalMessagesUsed || 0,
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%'
    },
    {
      title: 'Agentes Ativos',
      value: globalUsage?.activeAgents || 0,
      icon: Bot,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5%'
    },
    {
      title: 'Taxa de Resposta',
      value: '94%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+2%'
    },
    {
      title: 'Conversões',
      value: Math.floor((globalUsage?.totalMessagesUsed || 0) * 0.15),
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+8%'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Métricas de Performance</h1>
        <p className="text-gray-600 dark:text-gray-400">Acompanhe o desempenho dos seus agentes em tempo real</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Mensagens Diárias */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Mensagens Enviadas"
                />
                <Line 
                  type="monotone" 
                  dataKey="responses" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Respostas Recebidas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Taxa de Resposta */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Performance por Agente */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance por Agente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#10B981" name="Mensagens Processadas" />
                <Bar dataKey="conversions" fill="#3B82F6" name="Conversões" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Agentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Agente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Mensagens</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Taxa de Conversão</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Última Atividade</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, index) => (
                  <tr key={agent.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{agent.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${agent.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {agent.is_active ? 'Ativo' : 'Inativo'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {Math.floor(Math.random() * 200) + 50}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {Math.floor(Math.random() * 20) + 5}%
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(agent.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsPage;
