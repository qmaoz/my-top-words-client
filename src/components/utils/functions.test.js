import { describe, it, expect } from 'vitest';
import {
  getUserFacingError,
  nounCase,
  formatLocaleCount,
  hasWordFieldsChanged,
} from './functions.jsx';

describe('getUserFacingError', () => {
  it('ховає технічні англійські повідомлення', () => {
    expect(getUserFacingError({ message: 'Network Error' })).toBe('Сталася помилка. Спробуйте ще раз.');
  });

  it('показує українське повідомлення', () => {
    expect(getUserFacingError({ message: 'Неправильні дані для входу' }))
      .toBe('Неправильні дані для входу');
  });

  it('повертає null для скасованого thunk', () => {
    expect(getUserFacingError({ name: 'ConditionError', message: 'Aborted' })).toBeNull();
  });
});

describe('nounCase', () => {
  it('обирає форму для української множини', () => {
    expect(nounCase(1, 'користувач', 'користувачі', 'користувачів')).toBe('користувач');
    expect(nounCase(3, 'користувач', 'користувачі', 'користувачів')).toBe('користувачі');
    expect(nounCase(5, 'користувач', 'користувачі', 'користувачів')).toBe('користувачів');
  });

  it('для null повертає many', () => {
    expect(nounCase(null, 'слово', 'слова', 'слів')).toBe('слів');
  });
});

describe('formatLocaleCount', () => {
  it('форматує число для uk-UA', () => {
    expect(formatLocaleCount(1234)).toMatch(/1/);
    expect(formatLocaleCount(1234)).toMatch(/234/);
  });

  it('для null повертає тире', () => {
    expect(formatLocaleCount(null)).toBe('—');
  });
});

describe('hasWordFieldsChanged', () => {
  it('порівнює поля слова без зайвих пробілів', () => {
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

  it('бачить зміну перекладу', () => {
    expect(hasWordFieldsChanged(
      { word_text: 'Haus', word_translation_uk: 'дім', sentence_text: 'a', sentence_translation_uk: 'b' },
      { word_text: 'Haus', word_translation_uk: 'будинок', sentence_text: 'a', sentence_translation_uk: 'b' },
    )).toBe(true);
  });
});
