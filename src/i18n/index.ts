
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { pt } from './translations/pt';
import { es } from './translations/es';
import { en } from './translations/en';

// Função para detectar país baseado em IP (mantida para funcionalidade futura se necessário)
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
    
    const detectedLanguage = countryToLanguage[country] || 'pt';
    console.log('Idioma detectado:', detectedLanguage);
    
    return detectedLanguage;
  } catch (error) {
    console.error('Erro ao detectar país:', error);
    return 'pt'; // fallback para português
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
    fallbackLng: 'pt', // Mudança aqui: fallback para português
    debug: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Definir português como idioma padrão se não houver preferência salva
const savedLanguage = localStorage.getItem('selectedLanguage');
if (!savedLanguage) {
  localStorage.setItem('selectedLanguage', 'pt');
  i18n.changeLanguage('pt');
} else {
  i18n.changeLanguage(savedLanguage);
}

export default i18n;
