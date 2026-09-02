import { tr } from './translate';

export { speakText, stopSpeech, registerSpeechNotifier, initSpeechVoices } from './speech';

export function isThunkSkipped(error) {
  const message = typeof error?.message === 'string' ? error.message : '';
  return error?.name === 'ConditionError'
    || message.includes('condition callback')
    || message.includes('Aborted due to');
}

const TECHNICAL_PATTERNS = [
  /aborted/i,
  /condition callback/i,
  /request failed with status code/i,
  /axios/i,
  /unexpected token/i,
  /cannot read propert/i,
  /^error:/i,
  /\bsql\b/i,
  /sequelize/i,
  /\bjwt\b/i,
  /econnrefused/i,
  /etimedout/i,
];

// English API / validation texts → UI keys (so a German UI does not show English).
const API_MESSAGE_KEYS = {
  'network error': 'common.serverError',
  'failed to fetch': 'common.serverError',
  'internal server error': 'common.serverError',
  'invalid or expired token': 'errors.sessionExpired',
  'invalid username or password': 'auth.loginError',
  'this username is already taken': 'errors.usernameTaken',
  'username must be 1–20 characters': 'errors.usernameLength',
  'password must be 12–20 characters': 'errors.passwordLength',
  'password must contain at least one lowercase letter': 'errors.passwordLower',
  'password must contain at least one uppercase letter': 'errors.passwordUpper',
  'password must contain at least one digit': 'errors.passwordDigit',
  'password must contain at least one special character (!@#$%^&*()_=+/\\~`\'"-)': 'errors.passwordSpecial',
  'passwords do not match': 'auth.passwordMismatch',
  'password cannot be empty': 'errors.passwordEmpty',
  'you already have a set with this name': 'errors.setNameTaken',
  'set name must be 1–30 characters': 'errors.setNameLength',
  'set not found or access is denied': 'common.wordSetLoadError',
  'access denied': 'errors.accessDenied',
  'access to this word is denied': 'errors.accessDenied',
  'this entry already exists in the set': 'word.duplicateEntry',
  'the list contains duplicate words (word + sentence)': 'errors.duplicateWords',
  'too many messages this hour. please try again later.': 'errors.tooManyMessages',
  'too many attempts. please try again later.': 'errors.tooManyAttempts',
  'you cannot delete your own account': 'admin.deleteSelfError',
  'cannot delete an administrator account': 'admin.deleteAdminError',
  'admin accounts cannot be deleted by the user': 'errors.adminAccountLocked',
  'user not found': 'errors.userNotFound',
  'nothing to update': 'errors.nothingToUpdate',
  'invalid set visibility': 'errors.invalidVisibility',
  'unsupported language': 'errors.unsupportedLanguage',
  'unsupported set language': 'errors.unsupportedLanguage',
  'selected text or a comment is required': 'errors.remarkRequired',
  'only an internal path is allowed, e.g. /about': 'feedback.onlyInternalPath',
};

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

  const mappedKey = API_MESSAGE_KEYS[raw.toLowerCase()];
  if (mappedKey) return tr(mappedKey);

  const looksTechnical = TECHNICAL_PATTERNS.some((pattern) => pattern.test(raw));
  if (looksTechnical) return fb;

  return raw;
}

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