
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

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
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-green transition-colors">
                📧 {t('footer.email')}
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('footer.product')}</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#como-funciona" className="hover:text-white transition-colors">{t('header.howItWorks')}</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">{t('header.plans')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.simulate')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.integrations')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.blog')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.careers')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 ZapAgent AI. {t('footer.rights')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t('footer.terms')}
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t('footer.cookies')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
