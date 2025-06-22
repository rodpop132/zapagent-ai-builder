
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
      name: agent.name.length > 10 ? agent.name.substring(0, 10) + '...' : agent.name,
      messages: Math.floor(Math.random() * 200) + 50,
      conversions: Math.floor(Math.random() * 20) + 5,
    }));
  };

  const generatePieData = () => [
    { name: 'Respondidas', value: 85, color: '#10B981' },
    { name: 'Aguardando', value: 15, color: '#F59E0B' },
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
    <div className="space-y-4 md:space-y-8 px-2 md:px-0">
      {/* Título - Mobile Otimizado */}
      <div className="text-center md:text-left">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
          Métricas de Performance
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Acompanhe o desempenho dos seus agentes em tempo real
        </p>
      </div>

      {/* Cards de Estatísticas - Mobile: Grid 2x2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300 shadow-sm">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div className={`p-2 md:p-3 rounded-lg ${stat.bgColor} self-start`}>
                  <stat.icon className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`} />
                </div>
                <div className="text-left md:text-right min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{stat.title}</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs md:text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos - Mobile: Stack vertical */}
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
        {/* Gráfico de Mensagens Diárias */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Mensagens por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    fontSize: '12px',
                    padding: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Mensagens Enviadas"
                />
                <Line 
                  type="monotone" 
                  dataKey="responses" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Respostas Recebidas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Taxa de Resposta */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Taxa de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${value}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    fontSize: '12px',
                    padding: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras - Performance por Agente - Mobile: Full width */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Performance por Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={10}
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  fontSize: '12px',
                  padding: '8px'
                }}
              />
              <Bar dataKey="messages" fill="#10B981" name="Mensagens Processadas" />
              <Bar dataKey="conversions" fill="#3B82F6" name="Conversões" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Resumo - Mobile: Scroll horizontal */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Resumo dos Agentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900 dark:text-white min-w-[120px]">Agente</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900 dark:text-white min-w-[80px]">Status</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900 dark:text-white min-w-[80px]">Mensagens</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900 dark:text-white min-w-[80px]">Taxa Conv.</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900 dark:text-white min-w-[100px]">Última Ativ.</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, index) => (
                  <tr key={agent.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900 dark:text-white">
                      <div className="truncate max-w-[100px] md:max-w-none" title={agent.name}>
                        {agent.name}
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4">
                      <div className="flex items-center space-x-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${agent.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-xs md:text-sm">
                          {agent.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-gray-600 dark:text-gray-400">
                      {Math.floor(Math.random() * 200) + 50}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-gray-600 dark:text-gray-400">
                      {Math.floor(Math.random() * 20) + 5}%
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-gray-600 dark:text-gray-400">
                      <div className="text-xs md:text-sm">
                        {new Date(agent.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </div>
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
