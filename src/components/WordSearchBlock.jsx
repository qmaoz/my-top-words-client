import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Pagination, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { WarningMessage, Toast } from './utils/messages';
import WordSetTable from './WordSetTable';
import { selectIsAuth } from '../redux/slices/auth';
import { deleteWord, updateWord } from '../redux/slices/words';
import { toggleWordLearned } from '../redux/slices/word-sets';
import { correctNounCase, formatLocaleCount, nounCase } from './utils/functions';

const WORDS_PER_PAGE = 10;

function normalizeSearch(value) {
  return value.trim().toLowerCase();
}

function wordMatchesSearch(word, query) {
  if (!query) return true;

  const fields = [
    word.word_text,
    word.word_translation_uk,
    word.sentence_text,
    word.sentence_translation_uk,
  ];

  return fields.some((field) => field?.toLowerCase().includes(query));
}

export default function WordSearchBlock({ title, words, isEditing }) {
  const dispatch = useDispatch();
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
    try {
      await dispatch(updateWord({ id: wordId, ...updatedData })).unwrap();
      setToast({ open: true, message: 'Слово оновлено', severity: 'success' });
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || 'Помилка під час оновлення слова', severity: 'error' });
    }
  };

  const handleFullDelete = async (wordId) => {
    if (window.confirm('Підтверджуєте видалення слова?')) {
      try {
        await dispatch(deleteWord(wordId)).unwrap();
        setToast({ open: true, message: 'Слово успішно видалено', severity: 'success' });
      } catch {
        setToast({ open: true, message: 'Не вдалося видалити слово', severity: 'error' });
      }
    }
  };

  const handleToggleLearned = async (wordId) => {
    try {
      await dispatch(toggleWordLearned({ wordId })).unwrap();
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || 'Помилка при зміні статусу слова', severity: 'error' });
    }
  };

  const handlePageChange = (_event, value) => {
    setPage(value);
  };

  const totalWords = words?.length ?? 0;
  const foundWords = filteredWords.length;
  const showPagination = totalPages > 1;
  const wordsPhrase = (count) => correctNounCase(count, 'слово та вираз', 'слова та вирази', 'слів та виразів');

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

      <Box className='content-block' sx={{ boxShadow: 2 }}>
        {totalWords > 0 && (
          <>
            <Box className='word-search-toolbar'>
              <TextField
                label='Пошук слова або речення'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                fullWidth
                size='small'
                className='word-search-input'
              />

              {isAuth && !isEditing && (
                <ToggleButtonGroup
                  exclusive
                  size='small'
                  value={learnedFilter}
                  onChange={(_event, value) => value && setLearnedFilter(value)}
                  className='word-search-filter'
                >
                  <ToggleButton value='all'>Усі</ToggleButton>
                  <ToggleButton value='unlearned'>Невивчені</ToggleButton>
                  <ToggleButton value='learned'>Вивчені</ToggleButton>
                </ToggleButtonGroup>
              )}
            </Box>

            <h4 className='word-search-summary'>
              {foundWords === totalWords
                ? `Усього: ${formatLocaleCount(totalWords)} ${wordsPhrase(totalWords)}`
                : `Знайдено: ${formatLocaleCount(foundWords)} з ${formatLocaleCount(totalWords)} ${wordsPhrase(totalWords)}`}
              {showPagination && ` · ${nounCase(currentPage, 'сторінка', 'сторінки', 'сторінок')} ${currentPage} з ${totalPages}`}
            </h4>

            {paginationBlock}
          </>
        )}

        {totalWords > 0 ? (
          foundWords > 0 ? (
            <WordSetTable
              className='mt-2'
              words={paginatedWords}
              isEditing={isEditing}
              isAuthorized={isAuth}
              showLearnedToggle={isAuth && !isEditing}
              onToggleLearned={handleToggleLearned}
              onUpdate={handleUpdateWord}
              onFullDelete={handleFullDelete}
            />
          ) : (
            <WarningMessage message={'Нічого не знайдено за вашим запитом'} className='mt-2' />
          )
        ) : (
          <WarningMessage message={'Немає лексики'} />
        )}

        {paginationBlock}
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
