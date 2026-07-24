import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './i18n/locales/en.json';

// Initialise i18n synchronously so tr() / t() work in tests without mocking.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}
