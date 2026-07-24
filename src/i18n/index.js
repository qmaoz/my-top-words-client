import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { SUPPORTED_LOCALES, getLocaleDir, isSupportedLocale } from '../components/utils/locales';

import en from './locales/en.json';
import uk from './locales/uk.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import ku from './locales/ku.json';
import el from './locales/el.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import ml from './locales/ml.json';
import tr from './locales/tr.json';
import zh from './locales/zh.json';
import it from './locales/it.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import bn from './locales/bn.json';
import id from './locales/id.json';
import ja from './locales/ja.json';
import vi from './locales/vi.json';

export const UI_LOCALE_STORAGE_KEY = 'ui_locale';
export const DEFAULT_UI_LOCALE = 'en';

const dictionaries = {
  en, uk, ru, ar, ku, el, es, de, fr, hi, ml, tr, zh, it, pl,
  pt, bn, id, ja, vi,
};

const resources = Object.fromEntries(
  Object.entries(dictionaries).map(([code, translation]) => [code, { translation }]),
);

export function resolveInitialUiLocale() {
  const stored = window.localStorage.getItem(UI_LOCALE_STORAGE_KEY);
  if (stored && isSupportedLocale(stored)) {
    return stored;
  }

  const browser = (window.navigator.language || '').slice(0, 2);
  if (isSupportedLocale(browser)) {
    return browser;
  }

  return DEFAULT_UI_LOCALE;
}

// Keeps the <html> lang/dir attributes in sync so RTL languages (Arabic) render correctly.
export function applyDocumentLocale(locale) {
  const target = isSupportedLocale(locale) ? locale : DEFAULT_UI_LOCALE;
  document.documentElement.setAttribute('lang', target);
  document.documentElement.setAttribute('dir', getLocaleDir(target));
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: resolveInitialUiLocale(),
    fallbackLng: DEFAULT_UI_LOCALE,
    supportedLngs: SUPPORTED_LOCALES.map((locale) => locale.code),
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

applyDocumentLocale(i18n.language);

i18n.on('languageChanged', (locale) => {
  applyDocumentLocale(locale);
});

export function changeUiLocale(locale) {
  if (!isSupportedLocale(locale)) return;
  window.localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);
  i18n.changeLanguage(locale);
}

export default i18n;
