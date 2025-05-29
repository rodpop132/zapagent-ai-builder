
const Dashboard = () => {
  return (
    <section id="dashboard-demo" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Painel completo para gerenciar seu agente
          </h2>
          <p className="text-xl text-brand-gray max-w-2xl mx-auto">
            Acompanhe conversas, analytics e performance do seu agente IA em tempo real
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-brand-green/10 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-brand-green mb-2">1.247</div>
              <div className="text-brand-gray">Mensagens enviadas</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">94%</div>
              <div className="text-brand-gray">Taxa de resposta</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
              <div className="text-brand-gray">Clientes atendidos</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold text-brand-dark mb-4">Conversas recentes</h3>
            <div className="space-y-3">
              {[
                { name: "João Silva", message: "Qual o horário de funcionamento?", time: "2 min" },
                { name: "Maria Santos", message: "Vocês fazem entrega no sábado?", time: "5 min" },
                { name: "Pedro Costa", message: "Gostaria de saber sobre os preços", time: "8 min" }
              ].map((conversation, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {conversation.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-brand-dark text-sm">{conversation.name}</p>
                      <p className="text-brand-gray text-sm">{conversation.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-brand-gray">{conversation.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
