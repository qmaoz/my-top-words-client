import { tr } from './translate';
import { DEFAULT_SOURCE_LOCALE, getLocaleLabel, normalizeSourceLocale } from './locales';

const SPEECH_LANG_TAGS = {
  de: 'de-DE',
  uk: 'uk-UA',
  ru: 'ru-RU',
  en: 'en-US',
  ar: 'ar-SA',
  hi: 'hi-IN',
  ml: 'ml-IN',
  tr: 'tr-TR',
  el: 'el-GR',
  zh: 'zh-CN',
  ku: 'ku',
  pl: 'pl-PL',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-PT',
  bn: 'bn-IN',
  id: 'id-ID',
  ja: 'ja-JP',
  vi: 'vi-VN',
};

let speakGeneration = 0;

const cancelSpeechNow = () => {
  if (!window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.cancel();
};

export const stopSpeech = () => {
  speakGeneration += 1;
  cancelSpeechNow();
};

export function isThunkSkipped(error) {
  const message = typeof error?.message === 'string' ? error.message : '';
  return error?.name === 'ConditionError'
    || message.includes('condition callback')
    || message.includes('Aborted due to');
}

const CYRILLIC_PATTERN = /[а-яА-ЯіїєґІЇЄҐ]/u;

const TECHNICAL_PATTERNS = [
  /aborted/i,
  /condition callback/i,
  /network error/i,
  /request failed/i,
  /axios/i,
  /unexpected token/i,
  /cannot read propert/i,
  /failed to fetch/i,
  /^error:/i,
  /sql/i,
  /sequelize/i,
  /jwt/i,
];

function extractErrorMessage(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;

  const nested = error?.message?.message;
  if (typeof nested === 'string') return nested;

  if (typeof error?.message === 'string') return error.message;

  return '';
}

export function getUserFacingError(error, fallback) {
  if (isThunkSkipped(error)) return null;

  const fb = fallback ?? tr('common.genericError');
  const raw = extractErrorMessage(error).trim();
  if (!raw) return fb;

  const looksTechnical = TECHNICAL_PATTERNS.some((pattern) => pattern.test(raw));
  const hasCyrillic = CYRILLIC_PATTERN.test(raw);

  if (looksTechnical || !hasCyrillic) {
    return fb;
  }

  return raw;
}

function getVoiceForLocale(localeCode) {
  const code = normalizeSourceLocale(localeCode);
  const voices = window.speechSynthesis.getVoices();
  const matchingVoices = voices.filter((voice) => {
    const lang = voice.lang.toLowerCase();
    return lang === code || lang.startsWith(`${code}-`);
  });

  if (matchingVoices.length === 0) {
    return null;
  }

  // Source - https://stackoverflow.com/a/5915122
  // Posted by Kelly, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-05-23, License - CC BY-SA 4.0
  const randomIndex = Math.floor(Math.random() * matchingVoices.length);
  return matchingVoices[randomIndex];
}

export const speakText = (text, localeCode = DEFAULT_SOURCE_LOCALE) => {
  if (!text?.trim()) {
    return;
  }

  if (!window.speechSynthesis) {
    return alert(tr('common.speechNotSupported'));
  }

  stopSpeech();
  const generation = speakGeneration;

  const code = normalizeSourceLocale(localeCode);
  const voice = getVoiceForLocale(code);

  if (!voice) {
    return alert(tr('common.sourceVoiceNotFound', { language: getLocaleLabel(code) }));
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = SPEECH_LANG_TAGS[code] ?? voice.lang ?? code;
  utterance.rate = 1;

  // Chrome queues speak() even after cancel(); defer and drop stale requests.
  window.setTimeout(() => {
    if (generation !== speakGeneration) {
      return;
    }

    cancelSpeechNow();
    window.speechSynthesis.speak(utterance);
  }, 0);
};

export const correctNounCase = (number, one, few, many) => {
  const ukCardinalRules = new Intl.PluralRules('uk-UK');
  if (ukCardinalRules.select(number) == 'one') return one;
  else if (ukCardinalRules.select(number) == 'few') return few;
  else if (ukCardinalRules.select(number) == 'many') return many;
  else return many;
};

export const formatLocaleCount = (value) => {
  if (value == null) return '—';
  const locale = document.documentElement.getAttribute('lang') || 'en';
  return Number(value).toLocaleString(locale);
};

export const nounCase = (count, one, few, many) => {
  if (count == null) return many;
  return correctNounCase(Number(count), one, few, many);
};

// the new string is not empty and different from the previous string
// or
// the previous string was not empty and the new one is different ("empty" is possible in this case)
export const isStateUpdateNeeded = (newStr, previousStr) => {
  return (
    (newStr != null && newStr.trim() != '' && newStr.trim().toLowerCase() != previousStr.trim().toLowerCase())
    ||
    (previousStr != null && previousStr.trim() != '' && newStr.trim().toLowerCase() != previousStr.trim().toLowerCase())
  );
};

const WORD_ENTRY_FIELDS = [
  'word_text',
  'word_translation_uk',
  'sentence_text',
  'sentence_translation_uk',
];

function normalizeWordField(value) {
  return String(value ?? '').trim();
}

export function hasWordFieldsChanged(original, updated) {
  return WORD_ENTRY_FIELDS.some(
    (key) => normalizeWordField(original?.[key]) !== normalizeWordField(updated?.[key]),
  );
}

// Compares the source pair and per-locale translations for the given locales.
export function hasWordEntryChanged(original, updated, locales = []) {
  if (normalizeWordField(original?.word_text) !== normalizeWordField(updated?.word_text)) return true;
  if (normalizeWordField(original?.sentence_text) !== normalizeWordField(updated?.sentence_text)) return true;

  return locales.some((locale) => {
    const originalTranslation = original?.translations?.[locale] ?? {};
    const updatedTranslation = updated?.translations?.[locale] ?? {};
    return (
      normalizeWordField(originalTranslation.word_translation) !== normalizeWordField(updatedTranslation.word_translation)
      || normalizeWordField(originalTranslation.sentence_translation) !== normalizeWordField(updatedTranslation.sentence_translation)
    );
  });
}