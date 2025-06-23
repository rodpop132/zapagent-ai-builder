
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
  };

  const handleNavigation = (path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      navigate(path);
    } catch (error) {
      console.error('Erro ao navegar:', error);
    }
  };

  return (
    <footer className="bg-brand-dark text-white py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">ZA</span>
              </div>
              <span className="text-lg md:text-xl font-bold">ZapAgent AI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md text-sm md:text-base leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="mailto:contacto@zap-agent.com" 
                className="text-gray-400 hover:text-brand-green transition-colors text-sm md:text-base touch-manipulation inline-flex items-center space-x-2"
              >
                <span>📧</span>
                <span>{t('footer.email')}</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm md:text-base">{t('footer.product')}</h4>
            <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
              <li>
                <button 
                  onClick={(e) => scrollToSection('como-funciona', e)} 
                  className="hover:text-white transition-colors text-left w-full py-1 touch-manipulation"
                  type="button"
                >
                  {t('header.howItWorks')}
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => scrollToSection('planos', e)} 
                  className="hover:text-white transition-colors text-left w-full py-1 touch-manipulation"
                  type="button"
                >
                  {t('header.plans')}
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => handleNavigation('/dashboard', e)} 
                  className="hover:text-white transition-colors text-left w-full py-1 touch-manipulation"
                  type="button"
                >
                  {t('footer.simulate')}
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => scrollToSection('faq', e)} 
                  className="hover:text-white transition-colors text-left w-full py-1 touch-manipulation"
                  type="button"
                >
                  {t('footer.integrations')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm md:text-base">{t('footer.company')}</h4>
            <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
              <li>
                <button 
                  onClick={(e) => handleNavigation('/sobre', e)} 
                  className="hover:text-white transition-colors text-left w-full py-1 touch-manipulation"
                  type="button"
                >
                  {t('footer.about')}
                </button>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-white transition-colors inline-block py-1 touch-manipulation"
                  onClick={(e) => e.preventDefault()}
                >
                  {t('footer.blog')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-white transition-colors inline-block py-1 touch-manipulation"
                  onClick={(e) => e.preventDefault()}
                >
                  {t('footer.careers')}
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contacto@zap-agent.com" 
                  className="hover:text-white transition-colors inline-block py-1 touch-manipulation"
                >
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
            © 2024 ZapAgent AI. {t('footer.rights')}
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
            <a 
              href="#" 
              className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors touch-manipulation"
              onClick={(e) => e.preventDefault()}
            >
              {t('footer.terms')}
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors touch-manipulation"
              onClick={(e) => e.preventDefault()}
            >
              {t('footer.privacy')}
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors touch-manipulation"
              onClick={(e) => e.preventDefault()}
            >
              {t('footer.cookies')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
