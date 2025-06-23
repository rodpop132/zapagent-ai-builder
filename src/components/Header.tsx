
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

  const handleAuthClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/auth');
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/dashboard');
    setMobileMenuOpen(false);
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      console.error('Erro ao navegar para seção:', error);
    }
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 touch-manipulation"
          onClick={closeMobileMenu}
        >
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">ZA</span>
          </div>
          <span className="text-lg lg:text-xl font-bold text-gray-900 truncate">
            ZapAgent AI
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <button 
            onClick={(e) => scrollToSection('como-funciona', e)}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base touch-manipulation"
            type="button"
          >
            {t('header.howItWorks')}
          </button>
          <button 
            onClick={(e) => scrollToSection('planos', e)}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base touch-manipulation"
            type="button"
          >
            {t('header.plans')}
          </button>
          <button 
            onClick={(e) => scrollToSection('faq', e)}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base touch-manipulation"
            type="button"
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
                className="text-sm touch-manipulation"
                type="button"
              >
                {t('header.dashboard')}
              </Button>
              <Button 
                variant="outline"
                onClick={handleSignOut}
                size="sm"
                className="text-sm touch-manipulation"
                type="button"
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
                className="text-sm touch-manipulation"
                type="button"
              >
                {t('header.login')}
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white text-sm touch-manipulation"
                onClick={handleAuthClick}
                size="sm"
                type="button"
              >
                {t('header.createAgent')}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation rounded-lg hover:bg-gray-100"
          onClick={toggleMobileMenu}
          type="button"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            <button 
              onClick={(e) => scrollToSection('como-funciona', e)}
              className="block w-full text-left py-3 px-2 text-gray-600 hover:text-gray-900 transition-colors text-base rounded-lg hover:bg-gray-50 touch-manipulation"
              type="button"
            >
              {t('header.howItWorks')}
            </button>
            <button 
              onClick={(e) => scrollToSection('planos', e)}
              className="block w-full text-left py-3 px-2 text-gray-600 hover:text-gray-900 transition-colors text-base rounded-lg hover:bg-gray-50 touch-manipulation"
              type="button"
            >
              {t('header.plans')}
            </button>
            <button 
              onClick={(e) => scrollToSection('faq', e)}
              className="block w-full text-left py-3 px-2 text-gray-600 hover:text-gray-900 transition-colors text-base rounded-lg hover:bg-gray-50 touch-manipulation"
              type="button"
            >
              {t('header.faq')}
            </button>
            
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-center mb-4">
                <LanguageSelector />
              </div>
              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleDashboardClick}
                    className="w-full justify-center text-base py-3 touch-manipulation"
                    size="lg"
                    type="button"
                  >
                    {t('header.dashboard')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full justify-center text-base py-3 touch-manipulation"
                    size="lg"
                    type="button"
                  >
                    {t('header.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center text-base py-3 touch-manipulation" 
                    onClick={handleAuthClick}
                    size="lg"
                    type="button"
                  >
                    {t('header.login')}
                  </Button>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white justify-center text-base py-3 touch-manipulation"
                    onClick={handleAuthClick}
                    size="lg"
                    type="button"
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
