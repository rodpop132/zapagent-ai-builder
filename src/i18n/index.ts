
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { pt } from './translations/pt';
import { es } from './translations/es';
import { en } from './translations/en';

// Função para detectar país baseado em IP (usando um serviço gratuito)
const detectCountryAndSetLanguage = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const country = data.country_code?.toLowerCase();
    
    console.log('País detectado:', country);
    
    // Mapear países para idiomas
    const countryToLanguage: { [key: string]: string } = {
      'br': 'pt',
      'pt': 'pt',
      'es': 'es',
      'ar': 'es',
      'mx': 'es',
      'co': 'es',
      'pe': 'es',
      'cl': 'es',
      'us': 'en',
      'gb': 'en',
      'ca': 'en',
      'au': 'en',
      'nz': 'en'
    };
    
    const detectedLanguage = countryToLanguage[country] || 'en';
    console.log('Idioma detectado:', detectedLanguage);
    
    // Definir idioma no localStorage para persistir
    localStorage.setItem('selectedLanguage', detectedLanguage);
    
    return detectedLanguage;
  } catch (error) {
    console.error('Erro ao detectar país:', error);
    return 'en'; // fallback para inglês
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt,
      es, 
      en
    },
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Detectar país e definir idioma na inicialização
detectCountryAndSetLanguage().then(language => {
  i18n.changeLanguage(language);
});

export default i18n;
