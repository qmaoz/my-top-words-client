import { describe, it, expect } from 'vitest';
import { SUPPORTED_LOCALES } from '../utils/locales';

const catalogs = import.meta.glob('./locales/*.json', { eager: true, import: 'default' });

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
const PLURAL_KEYS = ['common.word', 'admin.message', 'admin.user', 'admin.set', 'about.words'];

function flatten(obj, prefix = '') {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, path));
    } else {
      out[path] = value;
    }
  }
  return out;
}

function baseKey(path) {
  return path.replace(PLURAL_SUFFIX, '');
}

function pluralForm(path) {
  return path.match(PLURAL_SUFFIX)?.[1] ?? null;
}

function placeholders(value) {
  return [...String(value).matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)]
    .map((match) => match[1].trim())
    .sort();
}

/** Categories used for typical UI counts (0–200), plus `_other` as i18next fallback. */
function requiredPluralForms(locale) {
  const rules = new Intl.PluralRules(locale);
  const forms = new Set(['other']);
  for (let n = 0; n <= 200; n += 1) {
    forms.add(rules.select(n));
  }
  return forms;
}

function catalogCode(filePath) {
  return filePath.replace('./locales/', '').replace('.json', '');
}

const en = catalogs['./locales/en.json'];
const enFlat = flatten(en);

describe('i18n locale catalogs', () => {
  const codes = Object.keys(catalogs).map(catalogCode).sort();
  const supported = SUPPORTED_LOCALES.map((locale) => locale.code).sort();

  it('has a JSON file for every supported locale and no extras', () => {
    expect(codes).toEqual(supported);
  });

  it.each(codes.filter((code) => code !== 'en'))(
    '%s has the same non-plural keys as en.json',
    (code) => {
      const flat = flatten(catalogs[`./locales/${code}.json`]);
      const enBases = new Set(Object.keys(enFlat).map(baseKey));
      const locBases = new Set(Object.keys(flat).map(baseKey));
      expect([...locBases].sort()).toEqual([...enBases].sort());
    },
  );

  it.each(codes.filter((code) => code !== 'en'))(
    '%s keeps the same interpolation placeholders as English',
    (code) => {
      const flat = flatten(catalogs[`./locales/${code}.json`]);
      for (const [key, value] of Object.entries(enFlat)) {
        const form = pluralForm(key);
        const locKey = form ? `${baseKey(key)}_${form}` : key;
        const locValue = flat[locKey] ?? flat[`${baseKey(key)}_other`] ?? flat[key];
        if (typeof locValue !== 'string') continue;
        expect(placeholders(locValue), locKey).toEqual(placeholders(value));
      }
    },
  );

  it.each(codes)('%s has only the plural forms this language needs', (code) => {
    const flat = flatten(catalogs[`./locales/${code}.json`]);
    const needed = requiredPluralForms(code);
    for (const pluralKey of PLURAL_KEYS) {
      const present = new Set(
        Object.keys(flat)
          .filter((key) => baseKey(key) === pluralKey)
          .map(pluralForm)
          .filter(Boolean),
      );
      expect(present, pluralKey).toEqual(needed);
    }
  });
});
