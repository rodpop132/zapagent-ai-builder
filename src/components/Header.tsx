
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = () => {
    navigate('/auth');
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 animate-in slide-in-from-top-4 duration-300 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-all duration-300 hover:scale-110 group">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center group-hover:rotate-12 group-hover:shadow-lg transition-all duration-300">
            <span className="text-white font-bold text-sm">ZA</span>
          </div>
          <span className="text-lg md:text-xl font-bold text-brand-dark group-hover:text-brand-green transition-colors duration-300">ZapAgent AI</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection('como-funciona')}
            className="text-brand-gray hover:text-brand-dark transition-all duration-300 hover:scale-110 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left group"
          >
            Como funciona
          </button>
          <button 
            onClick={() => scrollToSection('planos')}
            className="text-brand-gray hover:text-brand-dark transition-all duration-300 hover:scale-110 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left group"
          >
            Planos
          </button>
          <button 
            onClick={() => scrollToSection('faq')}
            className="text-brand-gray hover:text-brand-dark transition-all duration-300 hover:scale-110 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left group"
          >
            FAQ
          </button>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleDashboardClick}
                className="transition-all duration-300 hover:scale-110 hover:border-brand-green hover:text-brand-green hover:shadow-lg group"
              >
                Dashboard
              </Button>
              <Button 
                className="bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-brand-green/25 group"
                onClick={handleDashboardClick}
              >
                Acessar Painel
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="transition-all duration-300 hover:scale-110 hover:border-brand-green hover:text-brand-green hover:shadow-lg group" 
                onClick={handleAuthClick}
              >
                Entrar
              </Button>
              <Button 
                className="bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-brand-green/25 group"
                onClick={handleDashboardClick}
              >
                Criar agente grátis
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-brand-gray hover:text-brand-dark transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-4 space-y-4">
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className="block w-full text-left py-2 text-brand-gray hover:text-brand-dark transition-colors"
            >
              Como funciona
            </button>
            <button 
              onClick={() => scrollToSection('planos')}
              className="block w-full text-left py-2 text-brand-gray hover:text-brand-dark transition-colors"
            >
              Planos
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left py-2 text-brand-gray hover:text-brand-dark transition-colors"
            >
              FAQ
            </button>
            
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleDashboardClick}
                    className="w-full justify-center"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-white justify-center"
                    onClick={handleDashboardClick}
                  >
                    Acessar Painel
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center" 
                    onClick={handleAuthClick}
                  >
                    Entrar
                  </Button>
                  <Button 
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-white justify-center"
                    onClick={handleDashboardClick}
                  >
                    Criar agente grátis
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
