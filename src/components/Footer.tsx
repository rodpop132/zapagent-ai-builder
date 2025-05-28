
const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ZA</span>
              </div>
              <span className="text-xl font-bold">ZapAgent AI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Transforme o seu atendimento com inteligência artificial. 
              Crie agentes IA que respondem automaticamente no WhatsApp.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-green transition-colors">
                📧 suporte@zapagent.ai
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Produto</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">Planos e preços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Simular conversa</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Empresa</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 ZapAgent AI. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
