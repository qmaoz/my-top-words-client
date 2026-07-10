const MAX_ROWS = 100;
const MAX_FIELD_LENGTH = 255;

function splitLine(line, delimiter) {
  if (delimiter === 'tab') {
    return line.split('\t');
  }
  if (delimiter === 'pipe') {
    return line.split('|');
  }
  if (delimiter === 'slash') {
    return line.split('/');
  }

  if (line.includes('\t')) return line.split('\t');
  if (line.includes('|')) return line.split('|');
  return line.split('/');
}

function validateWordFields(word, lineNumber) {
  const fields = [
    ['word_text', 'Слово'],
    ['word_translation_uk', 'Переклад'],
    ['sentence_text', 'Речення'],
    ['sentence_translation_uk', 'Переклад речення'],
  ];

  for (const [key, label] of fields) {
    const value = word[key];
    if (!value) {
      return `Рядок ${lineNumber}: поле «${label}» порожнє`;
    }
    if (value.length > MAX_FIELD_LENGTH) {
      return `Рядок ${lineNumber}: поле «${label}» занадто довге (макс. ${MAX_FIELD_LENGTH})`;
    }
  }

  return null;
}

export function buildWordEntryKey(word) {
  return [
    word.word_text,
    word.word_translation_uk,
    word.sentence_text,
    word.sentence_translation_uk,
  ].map((value) => String(value).trim().toLowerCase()).join('\u0001');
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

export function formatWordSetAsBulkText(words) {
  return words
    .map((word) => [
      word.word_text,
      word.word_translation_uk,
      word.sentence_text,
      word.sentence_translation_uk,
    ].join(' / '))
    .join('\n');
}

export function parseBulkWords(text, delimiter = 'auto') {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { words: [], errors: [] };
  }

  if (lines.length > MAX_ROWS) {
    return { words: [], errors: [`Максимум ${MAX_ROWS} рядків за раз`] };
  }

  const words = [];
  const errors = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const parts = splitLine(line, delimiter).map((part) => part.trim());

    if (parts.length !== 4) {
      errors.push(`Рядок ${lineNumber}: очікується 4 поля (слово/переклад/речення/переклад речення), знайдено ${parts.length}`);
      return;
    }

    const word = {
      word_text: parts[0],
      word_translation_uk: parts[1],
      sentence_text: parts[2],
      sentence_translation_uk: parts[3],
    };

    const fieldError = validateWordFields(word, lineNumber);
    if (fieldError) {
      errors.push(fieldError);
      return;
    }

    words.push(word);
  });

  return { words, errors };
}

export const BULK_WORDS_PLACEHOLDER = `Haus / дім / Das Haus ist groß. / Дім великий.
Katze | кіт | Die Katze schläft. | Кішка спить.
...`;
