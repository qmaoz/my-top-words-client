const LOCALE_DEFINITIONS = [
  { code: 'de', en: 'German', native: 'Deutsch', dir: 'ltr' },
  { code: 'uk', en: 'Ukrainian', native: 'Українська', dir: 'ltr' },
  { code: 'ru', en: 'Russian', native: 'Русский', dir: 'ltr' },
  { code: 'en', en: 'English', native: 'English', dir: 'ltr' },
  { code: 'ar', en: 'Arabic', native: 'العربية', dir: 'rtl' },
  { code: 'hi', en: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { code: 'ml', en: 'Malayalam', native: 'മലയാളം', dir: 'ltr' },
  { code: 'tr', en: 'Turkish', native: 'Türkçe', dir: 'ltr' },
  { code: 'el', en: 'Greek', native: 'Ελληνικά', dir: 'ltr' },
  { code: 'zh', en: 'Chinese', native: '中文', dir: 'ltr' },
  { code: 'ku', en: 'Kurdish', native: 'Kurdî', dir: 'ltr' },
  { code: 'pl', en: 'Polish', native: 'Polski', dir: 'ltr' },
  { code: 'es', en: 'Spanish', native: 'Español', dir: 'ltr' },
  { code: 'fr', en: 'French', native: 'Français', dir: 'ltr' },
  { code: 'it', en: 'Italian', native: 'Italiano', dir: 'ltr' },
  { code: 'pt', en: 'Portuguese', native: 'Português', dir: 'ltr' },
  { code: 'bn', en: 'Bengali', native: 'বাংলা', dir: 'ltr' },
  { code: 'id', en: 'Indonesian', native: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'ja', en: 'Japanese', native: '日本語', dir: 'ltr' },
  { code: 'vi', en: 'Vietnamese', native: 'Tiếng Việt', dir: 'ltr' },
];

/** UI lists: alphabetical by English name for a uniform order across scripts. */
export const SUPPORTED_LOCALES = [...LOCALE_DEFINITIONS].sort((left, right) => (
  left.en.localeCompare(right.en, 'en', { sensitivity: 'base' })
));

const LOCALE_BY_CODE = new Map(LOCALE_DEFINITIONS.map((locale) => [locale.code, locale]));

export const DEFAULT_SOURCE_LOCALE = 'de';
export const DEFAULT_TRANSLATION_LOCALES = ['en'];
export const MIN_SET_LOCALES = 2;
export const DEFAULT_SET_LOCALES = [DEFAULT_SOURCE_LOCALE, ...DEFAULT_TRANSLATION_LOCALES];

export function buildDefaultSetLocales(preferredTranslationLocale) {
  const preferred = isSupportedLocale(preferredTranslationLocale)
    ? preferredTranslationLocale
    : DEFAULT_TRANSLATION_LOCALES[0];
  const translation = preferred === DEFAULT_SOURCE_LOCALE
    ? DEFAULT_TRANSLATION_LOCALES[0]
    : preferred;
  return [DEFAULT_SOURCE_LOCALE, translation];
}

export function splitSetLocales(locales) {
  const list = normalizeSetLocales(locales);
  return {
    sourceLocale: list[0],
    translationLocales: list.slice(1),
  };
}

export function normalizeSetLocales(locales) {
  const list = Array.isArray(locales) ? locales : [];
  const seen = new Set();
  const result = [];

  for (const code of list) {
    if (isSupportedLocale(code) && !seen.has(code)) {
      seen.add(code);
      result.push(code);
    }
  }

  for (const fallback of DEFAULT_SET_LOCALES) {
    if (result.length >= MIN_SET_LOCALES) break;
    if (!seen.has(fallback)) {
      seen.add(fallback);
      result.push(fallback);
    }
  }

  return result.length >= MIN_SET_LOCALES ? result : [...DEFAULT_SET_LOCALES];
}

export function isSupportedLocale(code) {
  return LOCALE_BY_CODE.has(code);
}

export function detectSystemUiLocale(fallback = 'en') {
  if (typeof navigator === 'undefined') return fallback;

  const candidates = [];
  if (navigator.language) candidates.push(navigator.language);
  if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);

  const seen = new Set();
  for (const raw of candidates) {
    const code = String(raw || '').slice(0, 2).toLowerCase();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    if (isSupportedLocale(code)) return code;
  }

  return fallback;
}

export function getLocale(code) {
  return LOCALE_BY_CODE.get(code) ?? null;
}

// Primary display name: the language's own (native) name, universal for any user.
export function getLocaleLabel(code) {
  return LOCALE_BY_CODE.get(code)?.native ?? code;
}

// Native name with English name in parentheses, e.g. "中文 (Chinese)".
export function getLocaleDisplay(code) {
  const locale = LOCALE_BY_CODE.get(code);
  if (!locale) return code;
  return locale.native === locale.en ? locale.native : `${locale.native} (${locale.en})`;
}

export function getLocaleDir(code) {
  return LOCALE_BY_CODE.get(code)?.dir ?? 'ltr';
}

export function formatSetLocalesLine(sourceLocale, translationLocales, uiLocale) {
  if (!sourceLocale) return '';
  const source = getLocaleLabel(sourceLocale);
  const targets = (Array.isArray(translationLocales) ? translationLocales : [])
    .map((code) => getLocaleLabel(code))
    .filter(Boolean)
    .join(', ');
  if (!targets) return source;
  const arrow = getLocaleDir(uiLocale) === 'rtl' ? '←' : '→';
  return `${source} ${arrow} ${targets}`;
}

export function normalizeSourceLocale(code) {
  return isSupportedLocale(code) ? code : DEFAULT_SOURCE_LOCALE;
}

export function normalizeTranslationLocales(locales) {
  const list = Array.isArray(locales) ? locales : [];
  const seen = new Set();
  const result = [];

  for (const code of list) {
    if (isSupportedLocale(code) && !seen.has(code)) {
      seen.add(code);
      result.push(code);
    }
  }

  return result.length > 0 ? result : [...DEFAULT_TRANSLATION_LOCALES];
}
