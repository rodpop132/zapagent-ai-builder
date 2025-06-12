
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleAuthClick = () => {
    navigate('/auth');
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs md:text-sm">ZA</span>
          </div>
          <span className="text-base md:text-lg lg:text-xl font-bold text-gray-900">ZapAgent AI</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <button 
            onClick={() => scrollToSection('como-funciona')}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base"
          >
            {t('header.howItWorks')}
          </button>
          <button 
            onClick={() => scrollToSection('planos')}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base"
          >
            {t('header.plans')}
          </button>
          <button 
            onClick={() => scrollToSection('faq')}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base"
          >
            {t('header.faq')}
          </button>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
          <LanguageSelector />
          {user ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleDashboardClick}
                size="sm"
                className="text-sm"
              >
                {t('header.dashboard')}
              </Button>
              <Button 
                variant="outline"
                onClick={handleSignOut}
                size="sm"
                className="text-sm"
              >
                {t('header.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={handleAuthClick}
                size="sm"
                className="text-sm"
              >
                {t('header.login')}
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white text-sm"
                onClick={handleDashboardClick}
                size="sm"
              >
                {t('header.createAgent')}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              {t('header.howItWorks')}
            </button>
            <button 
              onClick={() => scrollToSection('planos')}
              className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              {t('header.plans')}
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              {t('header.faq')}
            </button>
            
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-center">
                <LanguageSelector />
              </div>
              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleDashboardClick}
                    className="w-full justify-center text-sm"
                    size="sm"
                  >
                    {t('header.dashboard')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full justify-center text-sm"
                    size="sm"
                  >
                    {t('header.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center text-sm" 
                    onClick={handleAuthClick}
                    size="sm"
                  >
                    {t('header.login')}
                  </Button>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white justify-center text-sm"
                    onClick={handleDashboardClick}
                    size="sm"
                  >
                    {t('header.createAgent')}
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
