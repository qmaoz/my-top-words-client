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

export function getUserFacingError(error, fallback = 'Сталася помилка. Спробуйте ще раз.') {
  if (isThunkSkipped(error)) return null;

  const raw = extractErrorMessage(error).trim();
  if (!raw) return fallback;

  const looksTechnical = TECHNICAL_PATTERNS.some((pattern) => pattern.test(raw));
  const hasCyrillic = CYRILLIC_PATTERN.test(raw);

  if (looksTechnical || !hasCyrillic) {
    return fallback;
  }

  return raw;
}

function getGermanVoice() {
  const voices = window.speechSynthesis.getVoices();
  const germanVoices = voices.filter((voice) => voice.lang.startsWith('de'));

  if (germanVoices.length === 0) {
    return null;
  }

  // Source - https://stackoverflow.com/a/5915122
  // Posted by Kelly, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-05-23, License - CC BY-SA 4.0
  const randomIndex = Math.floor(Math.random() * germanVoices.length);
  return germanVoices[randomIndex];
}

export const speakText = (text) => {
  if (!text?.trim()) {
    return;
  }

  if (!window.speechSynthesis) {
    return alert('Ваш браузер не підтримує синтез мовлення');
  }

  stopSpeech();
  const generation = speakGeneration;

  const germanVoice = getGermanVoice();

  if (!germanVoice) {
    return alert('Не знайдено німецького голосу. Додайте німецьку мову в налаштуваннях озвучування тексту на пристрої.');
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = germanVoice;
  utterance.lang = 'de-DE';
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
  return Number(value).toLocaleString('uk-UA');
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