import { tr } from './translate';
import {
  DEFAULT_TRANSLATION_LOCALES,
  getLocaleLabel,
  normalizeTranslationLocales,
} from './locales';

const MAX_ROWS = 2000;
const MAX_FIELD_LENGTH = 255;
const COLUMN_DELIMITER = '|';

function splitPipeLine(line) {
  return line.split(COLUMN_DELIMITER).map((part) => part.trim());
}

function joinPipeCells(cells) {
  return cells.map((cell) => String(cell ?? '').trim()).join(` ${COLUMN_DELIMITER} `);
}

// Duplicate detection depends only on the studied source pair (word + sentence).
export function buildWordEntryKey(word) {
  return [
    word.word_text,
    word.sentence_text,
  ].map((value) => String(value ?? '').trim().toLowerCase()).join('\u0001');
}

export function findDuplicateWordEntry(words, candidate, excludeId = null) {
  const candidateKey = buildWordEntryKey(candidate);

  return words.find(
    (word) => (
      (excludeId == null || Number(word.id) !== Number(excludeId))
      && buildWordEntryKey(word) === candidateKey
    ),
  ) ?? null;
}

export function partitionBulkWordsByExisting(words, existingWords = []) {
  const existingKeys = new Set(
    existingWords.map((word) => buildWordEntryKey(word)),
  );
  const batchKeys = new Set();
  const toAdd = [];
  let skipped = 0;

  for (const word of words) {
    const key = buildWordEntryKey(word);
    if (existingKeys.has(key) || batchKeys.has(key)) {
      skipped += 1;
      continue;
    }
    batchKeys.add(key);
    toAdd.push(word);
  }

  return { toAdd, skipped };
}

function compareBulkCells(left, right) {
  const max = Math.max(left.length, right.length);
  for (let index = 0; index < max; index += 1) {
    const a = String(left[index] ?? '').trim().toLocaleLowerCase();
    const b = String(right[index] ?? '').trim().toLocaleLowerCase();
    const cmp = a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
    if (cmp !== 0) return cmp;
  }
  return 0;
}

export function wordToBulkCells(word, translationLocales = DEFAULT_TRANSLATION_LOCALES) {
  const locales = normalizeTranslationLocales(translationLocales);
  const cells = [word.word_text, word.sentence_text];

  for (const locale of locales) {
    const translation = word.translations?.[locale] ?? {};
    cells.push(translation.word_translation ?? '');
    cells.push(translation.sentence_translation ?? '');
  }

  return cells;
}

export function sortWordsForBulkText(words, translationLocales = DEFAULT_TRANSLATION_LOCALES) {
  return [...(words ?? [])].sort((left, right) => (
    compareBulkCells(
      wordToBulkCells(left, translationLocales),
      wordToBulkCells(right, translationLocales),
    )
  ));
}

// Column order: source word, source sentence, then per locale: translation word, translation sentence.
export function formatWordSetAsBulkText(words, translationLocales = DEFAULT_TRANSLATION_LOCALES) {
  return sortWordsForBulkText(words, translationLocales)
    .map((word) => joinPipeCells(wordToBulkCells(word, translationLocales)))
    .join('\n');
}

function validateSourceField(value, label, lineNumber) {
  if (!value) {
    return tr('validation.rowFieldEmpty', { line: lineNumber, label });
  }
  if (value.length > MAX_FIELD_LENGTH) {
    return tr('validation.rowFieldTooLong', { line: lineNumber, label, max: MAX_FIELD_LENGTH });
  }
  return null;
}

function translationsEqual(left, right, locales) {
  for (const locale of locales) {
    const a = left?.[locale] ?? {};
    const b = right?.[locale] ?? {};
    if (String(a.word_translation ?? '').trim() !== String(b.word_translation ?? '').trim()) {
      return false;
    }
    if (String(a.sentence_translation ?? '').trim() !== String(b.sentence_translation ?? '').trim()) {
      return false;
    }
  }
  return true;
}

export function diffWordsForSync(existingWords = [], nextWords = [], translationLocales = DEFAULT_TRANSLATION_LOCALES) {
  const locales = normalizeTranslationLocales(translationLocales);
  const existingByKey = new Map(
    existingWords.map((word) => [buildWordEntryKey(word), word]),
  );
  const nextKeys = new Set();
  const toCreate = [];
  const toUpdate = [];
  const duplicateKeys = new Set();

  for (const word of nextWords) {
    const key = buildWordEntryKey(word);
    if (nextKeys.has(key)) {
      duplicateKeys.add(key);
      continue;
    }
    nextKeys.add(key);

    const existing = existingByKey.get(key);
    if (!existing) {
      toCreate.push(word);
      continue;
    }

    if (!translationsEqual(existing.translations, word.translations, locales)) {
      toUpdate.push({ ...word, id: existing.id });
    }
  }

  const toDelete = existingWords.filter((word) => !nextKeys.has(buildWordEntryKey(word)));

  return {
    toCreate,
    toUpdate,
    toDelete,
    hasDuplicates: duplicateKeys.size > 0,
    added: toCreate.length,
    updated: toUpdate.length,
    removed: toDelete.length,
    hasChanges: toCreate.length > 0 || toUpdate.length > 0 || toDelete.length > 0,
  };
}

export function parseBulkWords(text, translationLocales = DEFAULT_TRANSLATION_LOCALES) {
  const locales = normalizeTranslationLocales(translationLocales);
  const expectedColumns = 2 + locales.length * 2;

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { words: [], errors: [] };
  }

  if (lines.length > MAX_ROWS) {
    return { words: [], errors: [tr('validation.maxRows', { max: MAX_ROWS })] };
  }

  const words = [];
  const errors = [];
  const seenKeys = new Set();

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const parts = splitPipeLine(line);

    if (parts.length !== expectedColumns) {
      errors.push(tr('validation.rowColumns', {
        line: lineNumber,
        expected: expectedColumns,
        found: parts.length,
      }));
      return;
    }

    const word = {
      word_text: parts[0],
      sentence_text: parts[1],
      translations: {},
    };

    const sourceWordError = validateSourceField(word.word_text, tr('validation.fieldWord'), lineNumber);
    if (sourceWordError) {
      errors.push(sourceWordError);
      return;
    }
    const sourceSentenceError = validateSourceField(word.sentence_text, tr('validation.fieldSentence'), lineNumber);
    if (sourceSentenceError) {
      errors.push(sourceSentenceError);
      return;
    }

    let hasFieldError = false;
    locales.forEach((locale, localeIndex) => {
      const wordTranslation = parts[2 + localeIndex * 2];
      const sentenceTranslation = parts[3 + localeIndex * 2];
      const label = getLocaleLabel(locale);

      const wordError = validateSourceField(
        wordTranslation,
        tr('validation.fieldTranslation', { label }),
        lineNumber,
      );
      if (wordError) {
        errors.push(wordError);
        hasFieldError = true;
        return;
      }
      const sentenceError = validateSourceField(
        sentenceTranslation,
        tr('validation.fieldSentenceTranslation', { label }),
        lineNumber,
      );
      if (sentenceError) {
        errors.push(sentenceError);
        hasFieldError = true;
        return;
      }

      word.translations[locale] = {
        word_translation: wordTranslation,
        sentence_translation: sentenceTranslation,
      };
    });

    if (hasFieldError) return;

    const key = buildWordEntryKey(word);
    if (seenKeys.has(key)) {
      errors.push(tr('validation.rowDuplicate', { line: lineNumber }));
      return;
    }
    seenKeys.add(key);

    words.push(word);
  });

  return { words, errors };
}

export function buildBulkPlaceholder(translationLocales = DEFAULT_TRANSLATION_LOCALES) {
  const locales = normalizeTranslationLocales(translationLocales);
  const example = ['Haus', 'Das Haus ist groß.'];
  const samples = {
    uk: ['дім', 'Дім великий.'],
    ru: ['дом', 'Дом большой.'],
    en: ['house', 'The house is big.'],
    ar: ['منزل', 'المنزل كبير.'],
    hi: ['घर', 'घर बड़ा है।'],
    ml: ['വീട്', 'വീട് വലുതാണ്.'],
    tr: ['ev', 'Ev büyük.'],
    el: ['σπίτι', 'Το σπίτι είναι μεγάλο.'],
    zh: ['房子', '房子很大。'],
    ku: ['mal', 'Mal mezin e.'],
    pl: ['dom', 'Dom jest duży.'],
    es: ['casa', 'La casa es grande.'],
    fr: ['maison', 'La maison est grande.'],
    it: ['casa', 'La casa è grande.'],
    pt: ['casa', 'A casa é grande.'],
    bn: ['বাড়ি', 'বাড়িটি বড়।'],
    id: ['rumah', 'Rumah itu besar.'],
    ja: ['家', '家は大きい。'],
    vi: ['nhà', 'Ngôi nhà rất lớn.'],
  };

  for (const locale of locales) {
    const sample = samples[locale] || samples.en;
    example.push(sample[0], sample[1]);
  }

  return `${joinPipeCells(example)}\n...`;
}

export const BULK_WORDS_PLACEHOLDER = buildBulkPlaceholder(DEFAULT_TRANSLATION_LOCALES);
