import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, IconButton, MenuItem, Paper, Select, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';

import ExerciseBackButton from '../components/ExerciseBackButton';
import ReportSetIssueDialog from '../components/ReportSetIssueDialog';

import { fetchWordSet, reviewWordProgress, toggleWordLearned } from '../redux/slices/word-sets';
import { selectIsAuth, selectPreferredTranslationLocale } from '../redux/slices/auth';
import ProgressBar from '../components/ProgressBar';
import PronounceButton from '../components/wrappers/PronounceButton';
import { speakText, stopSpeech, isThunkSkipped } from '../components/utils/functions';
import CircularLoading from '../components/wrappers/CircularLoading';
import { ErrorMessage, Toast } from '../components/utils/messages';
import useFitText from '../components/utils/useFitText';
import { useDocumentTitle } from '../components/utils/useDocumentTitle';
import { DEFAULT_SOURCE_LOCALE, DEFAULT_TRANSLATION_LOCALES, getLocaleLabel } from '../components/utils/locales';

function getWordTranslation(word, locale) {
  if (!word) return {};
  const fromMap = word.translations?.[locale];
  if (fromMap) return fromMap;
  if (locale === 'uk') {
    return {
      word_translation: word.word_translation_uk ?? '',
      sentence_translation: word.sentence_translation_uk ?? '',
    };
  }
  return {};
}

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function isDue(word, nowMs) {
  if (!word?.nextAt) return false;
  return new Date(word.nextAt).getTime() <= nowMs;
}

function isDeferred(word, nowMs) {
  if (!word?.nextAt) return false;
  return new Date(word.nextAt).getTime() > nowMs;
}

/** overdue (oldest first) → in progress → new; each group shuffled except overdue keeps age order with light shuffle of ties. */
function buildTrainerWordList(words) {
  if (!words?.length) return [];

  const nowMs = Date.now();
  const allLearned = words.every((word) => word.isLearned);
  const pool = allLearned ? [...words] : words.filter((word) => !word.isLearned);

  const available = allLearned
    ? pool
    : pool.filter((word) => !isDeferred(word, nowMs));

  if (allLearned) {
    return shuffleArray(available);
  }

  const overdue = [];
  const inProgress = [];
  const fresh = [];

  for (const word of available) {
    if (isDue(word, nowMs)) {
      overdue.push(word);
    } else if (word.hasProgress) {
      inProgress.push(word);
    } else {
      fresh.push(word);
    }
  }

  overdue.sort((a, b) => new Date(a.nextAt).getTime() - new Date(b.nextAt).getTime());

  return [
    ...overdue,
    ...shuffleArray(inProgress),
    ...shuffleArray(fresh),
  ];
}

function createQueueItem(word) {
  return {
    id: word.id,
    failedOnce: false,
    correctStreak: 0,
    totalRepeatNumber: 0,
    repeatAfter: 0,
  };
}

function getNextWordIndex(queue) {
  if (!queue?.length) return null;

  let nextWord = queue[0];
  for (let i = 0; i < queue.length; i++) {
    const wordInList = queue[i];

    if (nextWord.repeatAfter == null || (nextWord.repeatAfter > wordInList.repeatAfter && wordInList.repeatAfter != null)) {
      nextWord = wordInList;
    }
  }

  return nextWord.id;
}

function getPendingWordsCount(queue) {
  return queue?.filter((word) => word.repeatAfter != null).length ?? 0;
}

function isSessionFinished(queue) {
  return queue.length === 0 || getPendingWordsCount(queue) === 0;
}

function shouldGraduate(item) {
  // First-try success, or three correct answers in a row after a failure.
  return !item.failedOnce || item.correctStreak >= 3;
}

export default function TranslationExercisePage() {
  const isDebug = false;
  const { id } = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const { activeItem, activeItemStatus } = useSelector((state) => state.wordSets);
  const isAuth = useSelector(selectIsAuth);
  const preferredLocale = useSelector(selectPreferredTranslationLocale);
  const [isRevealed, setIsRevealed] = useState(false);
  const [wordsQueue, setWordsQueue] = useState([]);
  const [queueInitialized, setQueueInitialized] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isMarkingLearned, setIsMarkingLearned] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  const translationLocales = useMemo(
    () => activeItem?.translation_locales ?? DEFAULT_TRANSLATION_LOCALES,
    [activeItem?.translation_locales],
  );
  const sourceLocale = activeItem?.source_locale ?? DEFAULT_SOURCE_LOCALE;
  const [exerciseLocale, setExerciseLocale] = useState(translationLocales[0]);

  useEffect(() => {
    setExerciseLocale(
      preferredLocale && translationLocales.includes(preferredLocale)
        ? preferredLocale
        : translationLocales[0],
    );
  }, [id, translationLocales, preferredLocale]);

  const currentTranslation = getWordTranslation(currentWord, exerciseLocale);

  useEffect(() => {
    setWordsQueue([]);
    setQueueInitialized(false);
    setSessionComplete(false);
    setCurrentWordIndex(null);
    setCurrentWord(null);
    setIsRevealed(false);
  }, [id]);

  useEffect(() => {
    if (!activeItem?.words?.length || queueInitialized || sessionComplete) {
      return;
    }

    if (Number(activeItem.id) !== Number(id)) {
      return;
    }

    const trainerWords = buildTrainerWordList(activeItem.words);
    const initialQueue = trainerWords.map(createQueueItem);

    if (initialQueue.length === 0) {
      setQueueInitialized(true);
      return;
    }

    const firstWordId = initialQueue[0].id;
    setWordsQueue(initialQueue);
    setCurrentWordIndex(firstWordId);
    setCurrentWord(activeItem.words.find((word) => word.id == firstWordId) ?? null);
    setQueueInitialized(true);
  }, [activeItem, queueInitialized, sessionComplete, id]);

  const prevAuthRef = useRef(isAuth);

  useEffect(() => {
    const authChanged = prevAuthRef.current !== isAuth;
    prevAuthRef.current = isAuth;

    dispatch(fetchWordSet(
      authChanged ? { id, force: true } : id,
    )).unwrap().catch((error) => {
      if (isThunkSkipped(error)) return;

      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('exercise.loadError'),
        severity: 'error',
      });
    });
  }, [id, dispatch, isAuth, t]);

  const findWordById = (wordId) => activeItem?.words?.find((word) => word.id == wordId) ?? null;

  const finishSession = () => {
    setSessionComplete(true);
    setCurrentWordIndex(null);
    setCurrentWord(null);
    setIsRevealed(false);
  };

  const goToNextWord = (newQueue) => {
    stopSpeech();
    setIsRevealed(false);

    if (isSessionFinished(newQueue)) {
      setWordsQueue(newQueue);
      finishSession();
      return;
    }

    const nextWordId = getNextWordIndex(newQueue);
    setWordsQueue(newQueue);
    setCurrentWordIndex(nextWordId);
    setCurrentWord(findWordById(nextWordId));
  };

  const onShowAnswerClick = () => {
    setIsRevealed(true);
    speakText(currentWord?.sentence_text, sourceLocale);
  };

  const persistReview = async (outcome) => {
    if (!isAuth || !currentWord) return null;

    try {
      setIsSavingReview(true);
      return await dispatch(reviewWordProgress({
        wordId: currentWord.id,
        outcome,
      })).unwrap();
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('exercise.reviewSaveError'),
        severity: 'error',
      });
      return null;
    } finally {
      setIsSavingReview(false);
    }
  };

  const onYesButtonClick = async () => {
    const currentItem = wordsQueue.find((word) => word.id == currentWordIndex);
    if (!currentItem) return;

    const nextStreak = currentItem.correctStreak + 1;
    const nextTotal = currentItem.totalRepeatNumber + 1;
    const graduated = shouldGraduate({
      ...currentItem,
      correctStreak: nextStreak,
    });

    if (graduated) {
      await persistReview('graduated');

      const newWordsQueue = wordsQueue.map((word) => {
        if (word.id == currentWordIndex) {
          return {
            ...word,
            correctStreak: nextStreak,
            totalRepeatNumber: nextTotal,
            repeatAfter: null,
          };
        }

        const repeatAfter = word.repeatAfter > 0 ? word.repeatAfter - 1 : word.repeatAfter;
        return { ...word, repeatAfter };
      });

      goToNextWord(newWordsQueue);
      return;
    }

    const newWordsQueue = wordsQueue.map((word) => {
      if (word.id == currentWordIndex) {
        return {
          ...word,
          correctStreak: nextStreak,
          totalRepeatNumber: nextTotal,
          repeatAfter: nextStreak === 1 ? 1 : 4,
        };
      }

      const repeatAfter = word.repeatAfter > 0 ? word.repeatAfter - 1 : word.repeatAfter;
      return { ...word, repeatAfter };
    });

    goToNextWord(newWordsQueue);
  };

  const onNoButtonClick = async () => {
    await persistReview('again');

    const newWordsQueue = wordsQueue.map((word) => {
      if (word.id == currentWordIndex) {
        return {
          ...word,
          failedOnce: true,
          correctStreak: 0,
          totalRepeatNumber: word.totalRepeatNumber + 1,
          repeatAfter: 0,
        };
      }

      return { ...word };
    });

    goToNextWord(newWordsQueue);
  };

  const onMarkLearnedClick = async () => {
    if (!currentWord) return;

    if (!currentWord.isLearned) {
      try {
        setIsMarkingLearned(true);
        await dispatch(toggleWordLearned({ wordId: currentWord.id })).unwrap();
      } catch (error) {
        setToast({
          open: true,
          message: error?.message?.message || error?.message || t('exercise.markLearnedError'),
          severity: 'error',
        });
        return;
      } finally {
        setIsMarkingLearned(false);
      }
    }

    const newQueue = wordsQueue.filter((word) => word.id != currentWordIndex);
    goToNextWord(newQueue);
  };

  const onReturnButtonClick = () => {
    stopSpeech();
  };

  useEffect(() => () => stopSpeech(), []);

  const { containerRef: fitContainerRef, textRef: fitTextRef, isFitReady } = useFitText(
    [
      currentWord?.id,
      isRevealed,
      exerciseLocale,
      currentTranslation.sentence_translation,
      currentWord?.sentence_text,
      currentWord?.word_text,
      currentTranslation.word_translation,
    ],
    { max: 2.5, min: 0.5, step: 0.05 },
  );

  const exerciseCompleteBlock = (
    <Paper elevation={0} className='exercise-complete-block content-block'>
      <CheckCircleIcon className='exercise-complete-block__icon' />
      <Typography variant='h4' component='p' className='exercise-complete-block__title'>
        {t('exercise.complete')}
      </Typography>
    </Paper>
  );

  const isCurrentSetLoaded = activeItem
    && Number(activeItem.id) === Number(id)
    && activeItemStatus === 'loaded';
  useDocumentTitle(isCurrentSetLoaded ? activeItem?.name : undefined);

  const isPageLoading = activeItemStatus === 'loading'
    || Boolean(activeItem && Number(activeItem.id) !== Number(id));

  const hasWordsInSet = isCurrentSetLoaded && (activeItem?.words?.length ?? 0) > 0;
  const hasTrainerWords = wordsQueue.length > 0;
  const showTrainer = hasWordsInSet && hasTrainerWords && !sessionComplete;
  const showTopBack = isCurrentSetLoaded || activeItemStatus === 'error';
  const answersBusy = isMarkingLearned || isSavingReview;
  const allDeferred = hasWordsInSet
    && queueInitialized
    && !hasTrainerWords
    && !sessionComplete
    && !(activeItem.words.every((word) => word.isLearned));

  return (
    <>
      <Box className='app-container container exercise-page-content'>
        {showTopBack && (
          <Box className="exercise-page-topbar">
            <ExerciseBackButton wordSetId={id} onClick={onReturnButtonClick} />
            {showTrainer && (
              <Tooltip title={t('setRemark.reportTooltip')}>
                <IconButton
                  onClick={() => setReportOpen(true)}
                  aria-label={t('setRemark.reportAria')}
                  className="exercise-page-report"
                >
                  <FlagOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
        <Box className='exercise-page-body'>
        <Box className='exercise-page-main'>
        <CircularLoading isLoading={isPageLoading}>
          {activeItemStatus === 'error' ? (
            <ErrorMessage message={t('common.setLoadError')} />
          ) : isCurrentSetLoaded ? (
            <>
              {!hasWordsInSet ? (
                <ErrorMessage message={t('exercise.noWords')} />
              ) : sessionComplete ? (
                exerciseCompleteBlock
              ) : allDeferred ? (
                <Paper elevation={0} className='exercise-complete-block content-block'>
                  <Typography variant='h5' component='p' className='exercise-complete-block__title'>
                    {t('exercise.nothingDue')}
                  </Typography>
                </Paper>
              ) : showTrainer ? (
                <>
              <Box className="exercise-page-trainer">
              <Box className='exercise-progress-row df gap-3'>
                <Tooltip title={t('exercise.progressTooltip')}>
                  <span className='text-nowrap'>{t('exercise.progress')}</span>
                </Tooltip>
                <ProgressBar
                  total={wordsQueue.length}
                  completed={wordsQueue.filter((word) => word.repeatAfter == null).length}
                />
                {translationLocales.length > 1 && (
                  <Tooltip title={t('exercise.localeTooltip')}>
                    <Select
                      size="small"
                      value={exerciseLocale}
                      onChange={(event) => setExerciseLocale(event.target.value)}
                      className="exercise-locale-select"
                    >
                      {translationLocales.map((locale) => (
                        <MenuItem key={locale} value={locale}>{getLocaleLabel(locale)}</MenuItem>
                      ))}
                    </Select>
                  </Tooltip>
                )}
              </Box>
              {isAuth && isRevealed && !currentWord?.isLearned && (
                <Box className="exercise-learned-row">
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    startIcon={<CheckIcon />}
                    onClick={onMarkLearnedClick}
                    disabled={answersBusy}
                    className="exercise-btn-learned"
                  >
                    {t('exercise.markLearned')}
                  </Button>
                </Box>
              )}
              {isDebug && <>
                <p style={{fontSize: '0.5em', margin: 0}}>
                  isRevealed: {String(isRevealed)}; | currentWordIndex: {currentWordIndex};<br />
                  currentWord.id: {currentWord?.id};
                </p>
                {wordsQueue.map((word) => (
                  <Fragment key={word.id}>
                    <p style={{fontSize: '0.5em', margin: 0}}>id: {word.id} | streak: {word.correctStreak} | failed: {String(word.failedOnce)} | repeatAfter: {String(word.repeatAfter)} | total: {word.totalRepeatNumber} | {findWordById(word.id)?.sentence_text}</p>
                  </Fragment>
                ))}
              </>}
              <Paper elevation={0} className='main-content content-block exercise-card-paper'>
                <Box ref={fitContainerRef} className="exercise-fit-text-slot">
                  <Box ref={fitTextRef} className="exercise-fit-text">
                  {currentTranslation.sentence_translation && (
                    <Box className="exercise-fit-text__block">
                      <Typography className="exercise-fit-text__line">
                        {currentTranslation.sentence_translation}
                      </Typography>
                    </Box>
                  )}

                  {isRevealed && currentWord?.sentence_text && (() => {
                    const words = currentWord.sentence_text.split(' ');
                    const lastWord = words.pop();
                    return (
                      <Box className="exercise-fit-text__block">
                        <Typography className="exercise-fit-text__line">
                          {words.join(' ')}{words.length > 0 && ' '}
                          <span className="exercise-fit-text__nowrap">
                            {lastWord}
                            <span className="ms-1 exercise-fit-text__pronounce-slot">
                              {isFitReady ? (
                                <PronounceButton text={currentWord.sentence_text} locale={sourceLocale} />
                              ) : (
                                <span className="exercise-fit-text__pronounce-spacer" aria-hidden="true" />
                              )}
                            </span>
                          </span>
                        </Typography>
                      </Box>
                    );
                  })()}

                  {isRevealed && currentWord?.word_text && (() => {
                    const words = currentWord.word_text.split(' ');
                    const lastWord = words.pop();
                    return (
                      <Box className="exercise-fit-text__block">
                        <Typography className="exercise-fit-text__line">
                          {words.join(' ')}{words.length > 0 && ' '}
                          <span className="exercise-fit-text__nowrap">
                            {lastWord}
                            <span className="ms-1 exercise-fit-text__pronounce-slot">
                              {isFitReady ? (
                                <PronounceButton text={currentWord.word_text} locale={sourceLocale} />
                              ) : (
                                <span className="exercise-fit-text__pronounce-spacer" aria-hidden="true" />
                              )}
                            </span>
                          </span>
                        </Typography>
                      </Box>
                    );
                  })()}

                  {isRevealed && currentTranslation.word_translation && (
                    <Box className="exercise-fit-text__block">
                      <Typography className="exercise-fit-text__line">
                        {currentTranslation.word_translation}
                      </Typography>
                    </Box>
                  )}
                  </Box>
                </Box>
              </Paper>
              </Box>
                </>
              ) : null}
            </>
          ) : null}
        </CircularLoading>
        </Box>

        <Box className='exercise-page-actions exercise-buttons-stack w-100'>
          {showTrainer && (
            <>
              {!isRevealed ? (
                <Button
                  variant='contained'
                  fullWidth
                  color='primary'
                  startIcon={<VisibilityIcon />}
                  onClick={onShowAnswerClick}
                >
                  {t('exercise.showTranslation')}
                </Button>
              ) : (
                <Box className='exercise-answer-buttons'>
                  <Button
                    variant='contained'
                    color='success'
                    onClick={onYesButtonClick}
                    disabled={answersBusy}
                  >
                    {t('exercise.correct')}
                  </Button>
                  <Button
                    variant='contained'
                    color='error'
                    onClick={onNoButtonClick}
                    disabled={answersBusy}
                  >
                    {t('exercise.incorrect')}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
        </Box>

        <ReportSetIssueDialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          wordSetId={id}
          wordId={currentWord?.id ?? null}
        />
        <Toast {...toast} handleClose={handleCloseToast} />
      </Box>
    </>
  );
}
