
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-all duration-200 hover:scale-105">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ZA</span>
          </div>
          <span className="text-xl font-bold text-brand-dark">ZapAgent AI</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="#como-funciona" 
            className="text-brand-gray hover:text-brand-dark transition-all duration-200 hover:scale-105 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
          >
            Como funciona
          </a>
          <a 
            href="#planos" 
            className="text-brand-gray hover:text-brand-dark transition-all duration-200 hover:scale-105 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
          >
            Planos
          </a>
          <a 
            href="#faq" 
            className="text-brand-gray hover:text-brand-dark transition-all duration-200 hover:scale-105 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="transition-all duration-200 hover:scale-105 hover:border-brand-green hover:text-brand-green"
              >
                Dashboard
              </Button>
              <Button 
                className="bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/dashboard')}
              >
                Acessar Painel
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="hidden md:block transition-all duration-200 hover:scale-105 hover:border-brand-green hover:text-brand-green" 
                onClick={() => navigate('/auth')}
              >
                Entrar
              </Button>
              <Button 
                className="bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/auth')}
              >
                Criar agente grátis
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
