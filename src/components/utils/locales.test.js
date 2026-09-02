import { describe, it, expect, afterEach } from 'vitest';
import {
  normalizeSourceLocale,
  normalizeTranslationLocales,
  detectSystemUiLocale,
  getLocaleLabel,
  getLocaleDir,
  buildDefaultSetLocales,
  formatSetLocalesLine,
} from './locales';

describe('client locales', () => {
  it('normalizeSourceLocale falls back to de', () => {
    expect(normalizeSourceLocale('en')).toBe('en');
    expect(normalizeSourceLocale('zz')).toBe('de');
  });

  it('normalizeTranslationLocales removes duplicates and unsupported locales', () => {
    expect(normalizeTranslationLocales(['uk', 'uk', 'zz', 'ru'])).toEqual(['uk', 'ru']);
    expect(normalizeTranslationLocales([])).toEqual(['en']);
  });

  it('buildDefaultSetLocales uses the preferred translation language', () => {
    expect(buildDefaultSetLocales('uk')).toEqual(['de', 'uk']);
    expect(buildDefaultSetLocales('en')).toEqual(['de', 'en']);
    expect(buildDefaultSetLocales('de')).toEqual(['de', 'en']);
    expect(buildDefaultSetLocales('zz')).toEqual(['de', 'en']);
    expect(buildDefaultSetLocales()).toEqual(['de', 'en']);
  });

  it('formatSetLocalesLine flips the arrow in RTL UI', () => {
    expect(formatSetLocalesLine('de', ['en'], 'en')).toBe('Deutsch → English');
    expect(formatSetLocalesLine('de', ['en'], 'ar')).toBe('Deutsch ← English');
    expect(formatSetLocalesLine('de', [], 'ar')).toBe('Deutsch');
  });

  it('getLocaleLabel/getLocaleDir', () => {
    expect(getLocaleLabel('uk')).toBe('Українська');
    expect(getLocaleDir('ar')).toBe('rtl');
    expect(getLocaleDir('de')).toBe('ltr');
  });

  it('SUPPORTED_LOCALES are sorted by English name', async () => {
    const { SUPPORTED_LOCALES } = await import('./locales');
    const names = SUPPORTED_LOCALES.map((locale) => locale.en);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    expect(names).toEqual(sorted);
  });
});

describe('detectSystemUiLocale', () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });

  it('uses the first supported system language', () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { language: 'uk-UA', languages: ['uk-UA', 'en-US'] },
    });
    expect(detectSystemUiLocale('en')).toBe('uk');
  });

  it('falls back when the system language is unsupported', () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { language: 'xx-XX', languages: ['xx-XX'] },
    });
    expect(detectSystemUiLocale('en')).toBe('en');
  });
});
