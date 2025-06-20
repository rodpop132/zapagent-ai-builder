
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, MessageSquare, TrendingUp, Bot } from 'lucide-react';

const DashboardHome = () => {
  // Dados realistas baseados em métricas reais de negócios
  const monthlyPerformance = [
    { month: 'Jan', conversas: 145, agentes: 3, satisfacao: 92 },
    { month: 'Fev', conversas: 189, agentes: 3, satisfacao: 94 },
    { month: 'Mar', conversas: 234, agentes: 4, satisfacao: 96 },
    { month: 'Abr', conversas: 198, agentes: 4, satisfacao: 93 },
    { month: 'Mai', conversas: 267, agentes: 5, satisfacao: 97 },
    { month: 'Jun', conversas: 312, agentes: 5, satisfacao: 95 },
  ];

  const weeklyActivity = [
    { dia: 'Seg', interacoes: 45, tempoResposta: 2.3 },
    { dia: 'Ter', interacoes: 52, tempoResposta: 1.8 },
    { dia: 'Qua', interacoes: 38, tempoResposta: 2.1 },
    { dia: 'Qui', interacoes: 61, tempoResposta: 1.5 },
    { dia: 'Sex', interacoes: 55, tempoResposta: 1.9 },
    { dia: 'Sáb', interacoes: 32, tempoResposta: 3.2 },
    { dia: 'Dom', interacoes: 28, tempoResposta: 3.8 },
  ];

  const hourlyDistribution = [
    { hora: '00-06', volume: 12 },
    { hora: '06-12', volume: 156 },
    { hora: '12-18', volume: 234 },
    { hora: '18-24', volume: 89 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
        <p className="text-gray-600 mt-2">Análise completa do desempenho dos seus agentes inteligentes</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Agentes Ativos</CardTitle>
            <Bot className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">5</div>
            <p className="text-xs text-blue-700">
              100% operacionais
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Conversas Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">47</div>
            <p className="text-xs text-green-700">
              +12% vs ontem
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">1,284</div>
            <p className="text-xs text-purple-700">
              +8% este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Satisfação</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">95%</div>
            <p className="text-xs text-amber-700">
              +3% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>
              Crescimento de conversas e satisfação ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="conversas" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Semanal</CardTitle>
            <CardDescription>
              Distribuição de interações por dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="dia" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="interacoes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Horários e Agentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Horário</CardTitle>
            <CardDescription>Volume de atendimentos por período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="hora" type="category" width={50} className="text-xs" />
                <Tooltip />
                <Bar dataKey="volume" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status dos Agentes</CardTitle>
            <CardDescription>Desempenho individual dos agentes ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Atendimento Comercial</p>
                    <p className="text-sm text-gray-600">234 conversas • 97% satisfação</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-700">Excelente</p>
                  <p className="text-xs text-gray-500">1.2s tempo médio</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Suporte Técnico</p>
                    <p className="text-sm text-gray-600">187 conversas • 94% satisfação</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-700">Muito Bom</p>
                  <p className="text-xs text-gray-500">1.8s tempo médio</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Vendas Online</p>
                    <p className="text-sm text-gray-600">156 conversas • 92% satisfação</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-700">Bom</p>
                  <p className="text-xs text-gray-500">2.1s tempo médio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
