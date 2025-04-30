
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importações das traduções
import translationEN from '@/locales/en/translation.json';
import translationPT from '@/locales/pt-BR/translation.json';
import translationES from '@/locales/es/translation.json';

// Recursos de tradução
const resources = {
  en: {
    translation: translationEN
  },
  'pt-BR': {
    translation: translationPT
  },
  es: {
    translation: translationES
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources,
    fallbackLng: 'pt-BR',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      // Keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      // Cache user language on
      caches: ['localStorage', 'sessionStorage'],
    },
    
    react: {
      useSuspense: false // Prevents issues with suspense
    }
  });

// Create a language change event for components to listen to
export const languageChangeEvent = new CustomEvent('languageChanged');

// Add language change listener
i18n.on('languageChanged', (lng) => {
  // Update language in localStorage
  localStorage.setItem('i18nextLng', lng);
  
  // Dispatch custom event
  document.dispatchEvent(languageChangeEvent);
  
  // Update HTML lang attribute for accessibility
  document.documentElement.setAttribute('lang', lng);
  
  console.log(`Language changed to: ${lng}`);
});

export default i18n;
