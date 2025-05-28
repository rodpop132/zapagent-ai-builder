
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ZA</span>
          </div>
          <span className="text-xl font-bold text-brand-dark">ZapAgent AI</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#como-funciona" className="text-brand-gray hover:text-brand-dark transition-colors">
            Como funciona
          </a>
          <a href="#planos" className="text-brand-gray hover:text-brand-dark transition-colors">
            Planos
          </a>
          <a href="#faq" className="text-brand-gray hover:text-brand-dark transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
                Criar agente grátis
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="hidden md:block" onClick={() => navigate('/auth')}>
                Entrar
              </Button>
              <Button 
                className="bg-brand-green hover:bg-brand-green/90 text-white"
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
