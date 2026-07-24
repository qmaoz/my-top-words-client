import { describe, it, expect } from 'vitest';
import {
  parseBulkWords,
  formatWordSetAsBulkText,
  buildWordEntryKey,
  partitionBulkWordsByExisting,
  diffWordsForSync,
  buildBulkPlaceholder,
} from './parseBulkWords';

describe('buildBulkPlaceholder', () => {
  it('uses real samples for ja/vi/id instead of locale codes', () => {
    const text = buildBulkPlaceholder(['ja', 'vi', 'id']);
    expect(text).toContain('家');
    expect(text).toContain('nhà');
    expect(text).toContain('rumah');
    expect(text).not.toMatch(/\(ja\)|\(vi\)|\(id\)/);
  });
});

describe('parseBulkWords', () => {
  it('parses one line for one locale (4 columns)', () => {
    const { words, errors } = parseBulkWords('Haus | Das Haus ist groß. | дім | Дім великий.', ['uk']);
    expect(errors).toHaveLength(0);
    expect(words).toHaveLength(1);
    expect(words[0].word_text).toBe('Haus');
    expect(words[0].sentence_text).toBe('Das Haus ist groß.');
    expect(words[0].translations.uk).toEqual({ word_translation: 'дім', sentence_translation: 'Дім великий.' });
  });

  it('parses two translation locales (6 columns) in the correct order', () => {
    const { words, errors } = parseBulkWords(
      'Haus | Das Haus. | дім | Дім. | дом | Дом.',
      ['uk', 'ru'],
    );
    expect(errors).toHaveLength(0);
    expect(words[0].translations.uk.word_translation).toBe('дім');
    expect(words[0].translations.ru.word_translation).toBe('дом');
    expect(words[0].translations.ru.sentence_translation).toBe('Дом.');
  });

  it('allows slash inside a cell when delimiter is pipe', () => {
    const { words, errors } = parseBulkWords(
      'und | und das. | і / та | і / та речення.',
      ['uk'],
    );
    expect(errors).toHaveLength(0);
    expect(words[0].translations.uk.word_translation).toBe('і / та');
  });

  it('returns an error for wrong column count', () => {
    const { words, errors } = parseBulkWords('Haus | Das Haus. | дім', ['uk']);
    expect(words).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(typeof errors[0]).toBe('string');
    expect(errors[0].length).toBeGreaterThan(0);
  });

  it('round-trip: format → parse gives the same data', () => {
    const original = [{
      word_text: 'Haus',
      sentence_text: 'Das Haus.',
      translations: {
        uk: { word_translation: 'дім', sentence_translation: 'Дім.' },
        ru: { word_translation: 'дом', sentence_translation: 'Дом.' },
      },
    }];
    const text = formatWordSetAsBulkText(original, ['uk', 'ru']);
    expect(text).toContain('|');
    expect(text).not.toContain(' / ');
    const { words } = parseBulkWords(text, ['uk', 'ru']);
    expect(words[0].translations.uk).toEqual(original[0].translations.uk);
    expect(words[0].translations.ru).toEqual(original[0].translations.ru);
  });
});

describe('buildWordEntryKey / partition / diff', () => {
  it('deduplicates by source only (word + sentence)', () => {
    const a = { word_text: 'Haus', sentence_text: 'A', translations: { uk: { word_translation: 'дім' } } };
    const b = { word_text: 'Haus', sentence_text: 'A', translations: { uk: { word_translation: 'будинок' } } };
    expect(buildWordEntryKey(a)).toBe(buildWordEntryKey(b));
  });

  it('partitionBulkWordsByExisting skips existing words by source', () => {
    const existing = [{ word_text: 'Haus', sentence_text: 'A' }];
    const incoming = [
      { word_text: 'Haus', sentence_text: 'A', translations: {} },
      { word_text: 'Katze', sentence_text: 'B', translations: {} },
    ];
    const { toAdd, skipped } = partitionBulkWordsByExisting(incoming, existing);
    expect(skipped).toBe(1);
    expect(toAdd).toHaveLength(1);
    expect(toAdd[0].word_text).toBe('Katze');
  });

  it('diffWordsForSync detects create/update/delete', () => {
    const existing = [
      {
        id: 1,
        word_text: 'Haus',
        sentence_text: 'A',
        translations: { uk: { word_translation: 'дім', sentence_translation: 'Дім.' } },
      },
      {
        id: 2,
        word_text: 'Katze',
        sentence_text: 'B',
        translations: { uk: { word_translation: 'кіт', sentence_translation: 'Кіт.' } },
      },
    ];
    const next = [
      {
        word_text: 'Haus',
        sentence_text: 'A',
        translations: { uk: { word_translation: 'будинок', sentence_translation: 'Дім.' } },
      },
      {
        word_text: 'Hund',
        sentence_text: 'C',
        translations: { uk: { word_translation: 'пес', sentence_translation: 'Пес.' } },
      },
    ];
    const diff = diffWordsForSync(existing, next, ['uk']);
    expect(diff.updated).toBe(1);
    expect(diff.added).toBe(1);
    expect(diff.removed).toBe(1);
    expect(diff.toDelete[0].id).toBe(2);
  });
});
