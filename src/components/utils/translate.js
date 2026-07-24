import i18n from '../../i18n';

/** Translate outside React components (redux, parsers, validators). */
export function tr(key, options) {
  return i18n.t(key, options);
}

/** i18next plural form, e.g. tCount('common.word', 5) */
export function tCount(key, count, options = {}) {
  return i18n.t(key, { count, ...options });
}
