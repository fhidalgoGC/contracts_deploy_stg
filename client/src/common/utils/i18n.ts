import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../../locales/en.json';
import esTranslations from '../../locales/es.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

// Get saved language or detect browser language
const getSavedLanguage = () => {
  const savedLang = localStorage.getItem('language');
  if (savedLang && ['en', 'es'].includes(savedLang)) {
    return savedLang;
  }
  // Force Spanish as default instead of browser detection
  return 'es';
};

const initialLanguage = getSavedLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage, // Use saved/detected language
    fallbackLng: 'es',
    debug: false,
    keySeparator: '.',
    nsSeparator: false,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
    joinArrays: false,
    saveMissing: false,
    parseMissingKeyHandler: (key: string) => {
      console.log('🔑 Missing i18n key:', key);
      return key;
    }
  });

export default i18n;
