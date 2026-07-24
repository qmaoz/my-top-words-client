import { describe, it, expect } from 'vitest';
import {
  getUserFacingError,
  nounCase,
  formatLocaleCount,
  hasWordFieldsChanged,
  hasWordEntryChanged,
} from './functions.jsx';

describe('getUserFacingError', () => {
  it('hides technical English messages', () => {
    const result = getUserFacingError({ message: 'Network Error' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Should not expose the raw technical message
    expect(result).not.toMatch(/network error/i);
  });

  it('passes through a user-facing Cyrillic message', () => {
    expect(getUserFacingError({ message: 'Неправильні дані для входу' }))
      .toBe('Неправильні дані для входу');
  });

  it('returns null for a cancelled thunk', () => {
    expect(getUserFacingError({ name: 'ConditionError', message: 'Aborted' })).toBeNull();
  });
});

describe('nounCase', () => {
  it('returns correct form for Ukrainian plural', () => {
    expect(nounCase(1, 'користувач', 'користувачі', 'користувачів')).toBe('користувач');
    expect(nounCase(3, 'користувач', 'користувачі', 'користувачів')).toBe('користувачі');
    expect(nounCase(5, 'користувач', 'користувачі', 'користувачів')).toBe('користувачів');
  });

  it('returns many form for null', () => {
    expect(nounCase(null, 'слово', 'слова', 'слів')).toBe('слів');
  });
});

describe('formatLocaleCount', () => {
  it('formats a number', () => {
    expect(formatLocaleCount(1234)).toMatch(/1/);
    expect(formatLocaleCount(1234)).toMatch(/234/);
  });

  it('returns dash for null', () => {
    expect(formatLocaleCount(null)).toBe('—');
  });
});

describe('hasWordFieldsChanged', () => {
  it('ignores trailing spaces', () => {
    const original = {
      word_text: 'Haus ',
      word_translation_uk: 'дім',
      sentence_text: 'Das Haus ist groß.',
      sentence_translation_uk: 'Дім великий.',
    };
    const updated = {
      word_text: 'Haus',
      word_translation_uk: 'дім',
      sentence_text: 'Das Haus ist groß.',
      sentence_translation_uk: 'Дім великий.',
    };

    expect(hasWordFieldsChanged(original, updated)).toBe(false);
  });

  it('detects a changed translation', () => {
    expect(hasWordFieldsChanged(
      { word_text: 'Haus', word_translation_uk: 'дім', sentence_text: 'a', sentence_translation_uk: 'b' },
      { word_text: 'Haus', word_translation_uk: 'будинок', sentence_text: 'a', sentence_translation_uk: 'b' },
    )).toBe(true);
  });
});

describe('hasWordEntryChanged', () => {
  const original = {
    word_text: 'Haus',
    sentence_text: 'Das Haus.',
    translations: {
      uk: { word_translation: 'дім', sentence_translation: 'Дім.' },
      ru: { word_translation: 'дом', sentence_translation: 'Дом.' },
    },
  };

  it('returns false when nothing changed', () => {
    expect(hasWordEntryChanged(original, { ...original }, ['uk', 'ru'])).toBe(false);
  });

  it('detects a changed source word', () => {
    expect(hasWordEntryChanged(original, { ...original, word_text: 'Haus2' }, ['uk', 'ru'])).toBe(true);
  });

  it('detects a changed translation in one language', () => {
    const updated = {
      ...original,
      translations: {
        uk: { word_translation: 'будинок', sentence_translation: 'Дім.' },
        ru: { word_translation: 'дом', sentence_translation: 'Дом.' },
      },
    };
    expect(hasWordEntryChanged(original, updated, ['uk', 'ru'])).toBe(true);
  });

  it('ignores languages outside the watched list', () => {
    const updated = {
      ...original,
      translations: {
        ...original.translations,
        en: { word_translation: 'house', sentence_translation: 'The house.' },
      },
    };
    expect(hasWordEntryChanged(original, updated, ['uk', 'ru'])).toBe(false);
  });
});
