import { describe, it, expect } from 'vitest';
import {
  normalizeSourceLocale,
  normalizeTranslationLocales,
  getLocaleLabel,
  getLocaleDir,
} from './locales';

describe('client locales', () => {
  it('normalizeSourceLocale падає до de', () => {
    expect(normalizeSourceLocale('en')).toBe('en');
    expect(normalizeSourceLocale('zz')).toBe('de');
  });

  it('normalizeTranslationLocales прибирає дублікати та непідтримувані', () => {
    expect(normalizeTranslationLocales(['uk', 'uk', 'zz', 'ru'])).toEqual(['uk', 'ru']);
    expect(normalizeTranslationLocales([])).toEqual(['uk']);
  });

  it('getLocaleLabel/getLocaleDir', () => {
    expect(getLocaleLabel('uk')).toBe('Українська');
    expect(getLocaleDir('ar')).toBe('rtl');
    expect(getLocaleDir('de')).toBe('ltr');
  });

  it('SUPPORTED_LOCALES відсортовані за англійською назвою', async () => {
    const { SUPPORTED_LOCALES } = await import('./locales');
    const names = SUPPORTED_LOCALES.map((locale) => locale.en);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    expect(names).toEqual(sorted);
  });
});
