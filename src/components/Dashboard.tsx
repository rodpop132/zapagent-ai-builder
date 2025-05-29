
const Dashboard = () => {
  return (
    <section id="dashboard-demo" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-brand-green/5 rounded-full"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-500/5 rounded-full"></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-500/5 rounded-full animate-bounce delay-1000"></div>
      
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16 animate-in fade-in-50 duration-700">
          <h2 className="text-4xl font-bold text-brand-dark mb-4 animate-in slide-in-from-top-6 duration-700">
            Painel completo para gerenciar seu agente
          </h2>
          <p className="text-xl text-brand-gray max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-200">
            Acompanhe conversas, analytics e performance do seu agente IA em tempo real
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto hover:shadow-3xl transition-all duration-500 animate-in scale-in-95 duration-700 delay-300 group">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-brand-green/10 rounded-lg p-6 text-center hover:bg-brand-green/15 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in slide-in-from-left-6 duration-500 delay-500 group">
              <div className="text-3xl font-bold text-brand-green mb-2 group-hover:scale-110 transition-transform duration-300">1.247</div>
              <div className="text-brand-gray">Mensagens enviadas</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center hover:bg-blue-100 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in slide-in-from-bottom-6 duration-500 delay-700 group">
              <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">94%</div>
              <div className="text-brand-gray">Taxa de resposta</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center hover:bg-purple-100 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in slide-in-from-right-6 duration-500 delay-900 group">
              <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">156</div>
              <div className="text-brand-gray">Clientes atendidos</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-300 animate-in fade-in-50 duration-700 delay-1100">
            <h3 className="font-bold text-brand-dark mb-4 animate-in slide-in-from-left-4 duration-500 delay-1200">Conversas recentes</h3>
            <div className="space-y-3">
              {[
                { name: "João Silva", message: "Qual o horário de funcionamento?", time: "2 min" },
                { name: "Maria Santos", message: "Vocês fazem entrega no sábado?", time: "5 min" },
                { name: "Pedro Costa", message: "Gostaria de saber sobre os preços", time: "8 min" }
              ].map((conversation, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-white p-3 rounded-lg hover:shadow-md hover:scale-102 transition-all duration-300 animate-in slide-in-from-right-4 duration-500 group cursor-pointer"
                  style={{ animationDelay: `${1300 + (index * 150)}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-sm">
                        {conversation.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-brand-dark text-sm group-hover:text-brand-green transition-colors duration-300">{conversation.name}</p>
                      <p className="text-brand-gray text-sm">{conversation.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-brand-gray group-hover:text-brand-dark transition-colors duration-300">{conversation.time}</span>
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
