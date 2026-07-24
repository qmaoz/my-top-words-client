import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Pagination, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { WarningMessage, Toast } from './utils/messages';
import WordSetTable from './WordSetTable';
import { selectIsAuth } from '../redux/slices/auth';
import { deleteWord, updateWord } from '../redux/slices/words';
import { toggleWordLearned } from '../redux/slices/word-sets';
import { formatLocaleCount, hasWordEntryChanged } from './utils/functions';
import { tCount } from './utils/translate';
import { findDuplicateWordEntry } from './utils/parseBulkWords';
import { DEFAULT_SOURCE_LOCALE, DEFAULT_TRANSLATION_LOCALES } from './utils/locales';
import { useConfirm } from './utils/useConfirm';

const WORDS_PER_PAGE = 10;

function normalizeSearch(value) {
  return value.trim().toLowerCase();
}

function wordMatchesSearch(word, query) {
  if (!query) return true;

  const fields = [word.word_text, word.sentence_text];

  if (word.translations) {
    Object.values(word.translations).forEach((translation) => {
      fields.push(translation?.word_translation, translation?.sentence_translation);
    });
  }

  return fields.some((field) => field?.toLowerCase().includes(query));
}

export default function WordSearchBlock({
  title,
  words,
  isEditing,
  sourceLocale = DEFAULT_SOURCE_LOCALE,
  translationLocales = DEFAULT_TRANSLATION_LOCALES,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const isAuth = useSelector(selectIsAuth);
  const [searchQuery, setSearchQuery] = useState('');
  const [learnedFilter, setLearnedFilter] = useState('all');
  const [page, setPage] = useState(1);

  const normalizedQuery = normalizeSearch(searchQuery);

  const filteredWords = useMemo(() => {
    if (!words?.length) return [];

    return words.filter((word) => {
      if (!wordMatchesSearch(word, normalizedQuery)) return false;

      if (!isAuth || learnedFilter === 'all') return true;
      if (learnedFilter === 'learned') return Boolean(word.isLearned);
      return !word.isLearned;
    });
  }, [words, normalizedQuery, learnedFilter, isAuth]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / WORDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * WORDS_PER_PAGE;
    return filteredWords.slice(start, start + WORDS_PER_PAGE);
  }, [filteredWords, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, learnedFilter, words?.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleUpdateWord = async (wordId, updatedData) => {
    const word = words?.find((item) => Number(item.id) === Number(wordId));
    if (!word) {
      return true;
    }

    if (!hasWordEntryChanged(word, updatedData, translationLocales)) {
      return true;
    }

    if (findDuplicateWordEntry(words, updatedData, wordId)) {
      setToast({ open: true, message: t('word.duplicateEntry'), severity: 'error' });
      return false;
    }

    try {
      await dispatch(updateWord({ id: wordId, ...updatedData })).unwrap();
      setToast({ open: true, message: t('word.updated'), severity: 'success' });
      return true;
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || t('word.updateError'), severity: 'error' });
      return false;
    }
  };

  const handleFullDelete = async (wordId) => {
    const confirmed = await confirm({
      message: t('word.deleteConfirm'),
      confirmText: t('common.delete'),
      confirmColor: 'error',
    });

    if (!confirmed) return;

    try {
      await dispatch(deleteWord(wordId)).unwrap();
      setToast({ open: true, message: t('word.deleted'), severity: 'success' });
    } catch {
      setToast({ open: true, message: t('word.deleteError'), severity: 'error' });
    }
  };

  const handleToggleLearned = async (wordId) => {
    try {
      await dispatch(toggleWordLearned({ wordId })).unwrap();
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || t('word.learnedToggleError'), severity: 'error' });
    }
  };

  const handlePageChange = (_event, value) => {
    setPage(value);
  };

  const totalWords = words?.length ?? 0;
  const foundWords = filteredWords.length;
  const showPagination = totalPages > 1;

  const summaryText = foundWords === totalWords
    ? `${t('word.total', { count: totalWords })} ${tCount('common.word', totalWords)}`
    : t('word.found', { found: formatLocaleCount(foundWords), total: formatLocaleCount(totalWords) });

  const paginationBlock = showPagination && (
    <Stack spacing={2} className='word-search-pagination aic'>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color='primary'
        shape='rounded'
        size='large'
      />
    </Stack>
  );

  return (
    <>
      {title && title.trim() != '' && <h3>{title}</h3>}

      <Box className='content-block word-search-block' sx={{ boxShadow: 2 }}>
        {totalWords > 0 && (
          <>
            <Box className='word-search-toolbar'>
              <TextField
                label={t('word.searchPlaceholder')}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                fullWidth
                size='small'
                className='word-search-input'
                autoComplete="off"
              />

              {isAuth && !isEditing && (
                <Box className="word-search-filter-wrap">
                  <ToggleButtonGroup
                    exclusive
                    size='small'
                    value={learnedFilter}
                    onChange={(_event, value) => value && setLearnedFilter(value)}
                    className='word-search-filter'
                  >
                    <ToggleButton value='all' title={t('word.filterAllTitle')}>{t('word.filterAll')}</ToggleButton>
                    <ToggleButton value='unlearned' title={t('word.filterUnlearnedTitle')}>{t('word.filterUnlearned')}</ToggleButton>
                    <ToggleButton value='learned' title={t('word.filterLearnedTitle')}>{t('word.filterLearned')}</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}
            </Box>

            <h4 className='word-search-summary'>
              {summaryText}
              {showPagination && t('word.page', { current: currentPage, total: totalPages })}
            </h4>

            {paginationBlock}
          </>
        )}

        {totalWords > 0 ? (
          foundWords > 0 ? (
            <WordSetTable
              words={paginatedWords}
              isEditing={isEditing}
              isAuthorized={isAuth}
              showLearnedToggle={isAuth && !isEditing}
              onToggleLearned={handleToggleLearned}
              onUpdate={handleUpdateWord}
              onFullDelete={handleFullDelete}
              sourceLocale={sourceLocale}
              translationLocales={translationLocales}
            />
          ) : (
            <WarningMessage message={t('word.nothingFound')} />
          )
        ) : (
          <WarningMessage
            message={isEditing ? t('word.emptyInsert') : t('word.emptyNoWords')}
          />
        )}

        {paginationBlock}
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
