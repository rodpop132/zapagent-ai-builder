
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-brand-dark text-white py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ZA</span>
              </div>
              <span className="text-lg md:text-xl font-bold">ZapAgent AI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md text-sm md:text-base">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="mailto:contacto@zap-agent.com" className="text-gray-400 hover:text-brand-green transition-colors text-sm md:text-base">
                📧 {t('footer.email')}
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm md:text-base">{t('footer.product')}</h4>
            <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
              <li>
                <button 
                  onClick={() => scrollToSection('como-funciona')} 
                  className="hover:text-white transition-colors text-left"
                >
                  {t('header.howItWorks')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('planos')} 
                  className="hover:text-white transition-colors text-left"
                >
                  {t('header.plans')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="hover:text-white transition-colors text-left"
                >
                  {t('footer.simulate')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('faq')} 
                  className="hover:text-white transition-colors text-left"
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
                  onClick={() => navigate('/sobre')} 
                  className="hover:text-white transition-colors text-left"
                >
                  {t('footer.about')}
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">{t('footer.blog')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">{t('footer.careers')}</a>
              </li>
              <li>
                <a href="mailto:contacto@zap-agent.com" className="hover:text-white transition-colors">{t('footer.contact')}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
            © 2024 ZapAgent AI. {t('footer.rights')}
          </p>
          <div className="flex flex-wrap justify-center md:justify-end space-x-4 md:space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">
              {t('footer.terms')}
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">
              {t('footer.cookies')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
