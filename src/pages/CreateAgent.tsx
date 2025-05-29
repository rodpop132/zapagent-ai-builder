
import { useEffect } from 'react';

const CreateAgent = () => {
  useEffect(() => {
    // Add the event listener after component mounts
    const createAgentButton = document.querySelector("#createAgent");
    
    const handleCreateAgent = async () => {
      const nome = (document.querySelector("#nomeAgente") as HTMLInputElement)?.value;
      const prompt = (document.querySelector("#prompt") as HTMLTextAreaElement)?.value;
      const arquivo = (document.querySelector("#arquivo") as HTMLInputElement)?.files?.[0];
      const statusEl = document.querySelector("#status");
      const qrCodeEl = document.querySelector("#qrCode");

      if (!prompt) {
        alert("Escreve o prompt primeiro!");
        return;
      }

      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("prompt", prompt);
      if (arquivo) {
        formData.append("arquivo", arquivo);
      }

      if (statusEl) statusEl.textContent = "🔄 Gerando QR Code...";
      if (qrCodeEl) qrCodeEl.innerHTML = "";

      try {
        const res = await fetch("https://zapagent-api.onrender.com/create-agent", {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        if (data.qr) {
          if (qrCodeEl) {
            qrCodeEl.innerHTML = `<img src="${data.qr}" alt="QR Code do WhatsApp" class="mt-4 border rounded mx-auto max-w-sm" />`;
          }
          if (statusEl) statusEl.textContent = "✅ Agente ativo! Escaneia o QR com o WhatsApp.";
        } else {
          if (statusEl) statusEl.textContent = "❌ Erro ao criar agente.";
        }
      } catch (err) {
        console.error(err);
        if (statusEl) statusEl.textContent = "❌ Erro ao conectar com o servidor.";
      }
    };

    if (createAgentButton) {
      createAgentButton.addEventListener("click", handleCreateAgent);
    }

    // Cleanup event listener on unmount
    return () => {
      if (createAgentButton) {
        createAgentButton.removeEventListener("click", handleCreateAgent);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">ZA</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">ZapAgent AI</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Criar Novo Agente</h2>
            <p className="text-brand-gray">Configure seu agente de IA para WhatsApp</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <div>
              <label htmlFor="nomeAgente" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Agente
              </label>
              <input
                type="text"
                id="nomeAgente"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all duration-200"
                placeholder="Ex: Assistente de Vendas"
              />
            </div>

            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Prompt do Agente *
              </label>
              <textarea
                id="prompt"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Descreva como o agente deve se comportar, que tipo de perguntas deve responder e qual o seu objetivo..."
                required
              ></textarea>
            </div>

            <div>
              <label htmlFor="arquivo" className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo de Treino (opcional)
              </label>
              <input
                type="file"
                id="arquivo"
                accept=".pdf,.txt,.docx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-green file:text-white hover:file:bg-brand-green/90"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceitos: PDF, TXT, DOCX
              </p>
            </div>

            <button
              type="button"
              id="createAgent"
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Criar Agente
            </button>
          </form>

          {/* Status and QR Code Area */}
          <div className="mt-8 text-center">
            <div id="status" className="text-lg font-medium text-gray-600 mb-4"></div>
            <div id="qrCode" className="flex justify-center"></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 ZapAgent AI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CreateAgent;
