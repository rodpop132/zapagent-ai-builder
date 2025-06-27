
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { pt } from './translations/pt';
import { es } from './translations/es';
import { en } from './translations/en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt,
      es, 
      en
    },
    fallbackLng: 'es',
    lng: 'es', // Sempre iniciar em espanhol
    debug: false,
    detection: {
      order: [], // Desabilitar detecção automática
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Sempre forçar o idioma para espanhol
const initializeLanguage = () => {
  // Sempre definir espanhol como padrão, ignorando qualquer configuração salva
  localStorage.setItem('selectedLanguage', 'es');
  i18n.changeLanguage('es');
  console.log('Idioma definido para espanhol por padrão');
};

// Inicializar idioma
initializeLanguage();

export default i18n;
