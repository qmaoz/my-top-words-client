import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { fetchWordSet, toggleWordLearned } from '../redux/slices/word-sets';
import { selectIsAuth } from '../redux/slices/auth';
import ProgressBar from '../components/ProgressBar';
import PronounceButton from '../components/wrappers/PronounceButton';
import { speakText, stopSpeech } from '../components/utils/functions';
import CircularLoading from '../components/wrappers/CircularLoading';
import { ErrorMessage, Toast } from '../components/utils/messages';
import useFitText from '../components/utils/useFitText';

function getInitialTrainerWords(words) {
  if (!words?.length) return [];

  const allLearned = words.every((word) => word.isLearned);
  return allLearned ? [...words] : words.filter((word) => !word.isLearned);
}

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function createQueueItem(word) {
  return {
    id: word.id,
    correctRepeatNumber: 0,
    totalRepeatNumber: 0,
    repeatAfter: 0,
  };
}

function getNextWordIndex(queue) {
  if (!queue?.length) return null;

  let nextWord = queue[0];
  for (let i = 0; i < queue.length; i++) {
    const wordInList = queue[i];

    if (nextWord.repeatAfter == null || nextWord.repeatAfter > wordInList.repeatAfter && wordInList.repeatAfter != null) {
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

export default function TranslationExercisePage() {
  const isDebug = false;
  const { id } = useParams();
  const dispatch = useDispatch();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const { activeItem, activeItemStatus } = useSelector((state) => state.wordSets);
  const isAuth = useSelector(selectIsAuth);
  const [isRevealed, setIsRevealed] = useState(false);
  const [wordsQueue, setWordsQueue] = useState([]);
  const [queueInitialized, setQueueInitialized] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isMarkingLearned, setIsMarkingLearned] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);

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

    const trainerWords = getInitialTrainerWords(activeItem.words);
    const initialQueue = shuffleArray(trainerWords.map(createQueueItem));

    if (initialQueue.length === 0) {
      setQueueInitialized(true);
      return;
    }

    const firstWordId = initialQueue[0].id;
    setWordsQueue(initialQueue);
    setCurrentWordIndex(firstWordId);
    setCurrentWord(activeItem.words.find((word) => word.id == firstWordId) ?? null);
    setQueueInitialized(true);
  }, [activeItem, queueInitialized, sessionComplete]);

  useEffect(() => {
    (async () => {
      if (!activeItem || activeItem.id !== Number(id)) {
        try {
          await dispatch(fetchWordSet(id)).unwrap();
        } catch (error) {
          setToast({ open: true, message: error?.message?.message || error?.message || 'Помилка під час завантаження набору', severity: 'error' });
        }
      }
    })();
  }, [id, dispatch, activeItem]);

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
    speakText(currentWord?.sentence_text);
  };

  const onYesButtonClick = () => {
    const newWordsQueue = wordsQueue.map((word) => {
      if (word.id == currentWordIndex) {
        if (word.totalRepeatNumber == 1 && word.repeatAfter == null) {
          return { ...word };
        }

        const totalRepeatNumber = word.totalRepeatNumber + 1;
        const correctRepeatNumber = word.correctRepeatNumber + 1;
        let repeatAfter;

        if (correctRepeatNumber >= 3 || totalRepeatNumber == 1) {
          repeatAfter = null;
        } else if (correctRepeatNumber == 1) {
          repeatAfter = 1;
        } else if (correctRepeatNumber == 2) {
          repeatAfter = 4;
        }

        return { ...word, correctRepeatNumber, repeatAfter, totalRepeatNumber };
      }

      const repeatAfter = word.repeatAfter > 0 ? word.repeatAfter - 1 : word.repeatAfter;
      return { ...word, repeatAfter };
    });

    goToNextWord(newWordsQueue);
  };

  const onNoButtonClick = () => {
    const newWordsQueue = wordsQueue.map((word) => {
      if (word.id == currentWordIndex) {
        return {
          ...word,
          correctRepeatNumber: 0,
          totalRepeatNumber: word.totalRepeatNumber + 1,
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
          message: error?.message?.message || error?.message || 'Не вдалося позначити слово як вивчене',
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

  const { containerRef: fitContainerRef, textRef: fitTextRef } = useFitText(
    [
      currentWord?.id,
      isRevealed,
      currentWord?.sentence_translation_uk,
      currentWord?.sentence_text,
      currentWord?.word_text,
      currentWord?.word_translation_uk,
    ],
    { max: 2.5, min: 0.5, step: 0.05 },
  );

  const exerciseCompleteBlock = (
    <Paper elevation={2} className='exercise-complete-block content-block'>
      <CheckCircleIcon className='exercise-complete-block__icon' />
      <Typography variant='h4' component='p' className='exercise-complete-block__title'>
        Тренажер успішно пройдено!
      </Typography>
    </Paper>
  );

  const hasWordsInSet = (activeItem?.words?.length ?? 0) > 0;
  const hasTrainerWords = wordsQueue.length > 0;
  const showTrainer = hasWordsInSet && hasTrainerWords && !sessionComplete;

  return (
    <>
      <Box className='app-container container p-3 exercise-page-content'>
        <Box className='exercise-page-body'>
        <Box className='exercise-page-main'>
        <CircularLoading isLoading={activeItemStatus === 'loading'}>
          {!activeItem ? (
            <ErrorMessage message={'Набір не знайдено або доступ до нього заборонено, або стався збій'} />
          ) : <>
            {!hasWordsInSet ? (
              <ErrorMessage message={'Набір порожній'} />
            ) : sessionComplete ? (
              exerciseCompleteBlock
            ) : showTrainer ? <>
              <Box className="exercise-page-trainer">
              <Box className='df gap-3'>
                <span className='text-nowrap'>Кількість закріплених слів:</span>
                <ProgressBar total={wordsQueue.length} completed={wordsQueue.filter((word) => word.repeatAfter == null).length} />
              </Box>
              {isDebug && <>
                <p style={{fontSize: '0.5em', margin: 0}}>
                  isRevealed: {String(isRevealed)}; | currentWordIndex: {currentWordIndex};<br />
                  currentWord.id: {currentWord?.id};
                </p>
                {wordsQueue.map((word) => (
                  <Fragment key={word.id}>
                    <p style={{fontSize: '0.5em', margin: 0}}>id: {word.id} | correctRepeatNumber: {word.correctRepeatNumber} | repeatAfter: {word.repeatAfter} | totalRepeatNumber: {word.totalRepeatNumber} | {findWordById(word.id)?.sentence_text}</p>
                  </Fragment>
                ))}
              </>}
              <Paper elevation={2} className='main-content content-block exercise-card-paper' sx={{ mt: '1em' }}>
                <Box ref={fitContainerRef} className="exercise-fit-text-slot">
                  <Box ref={fitTextRef} className="exercise-fit-text">
                  {currentWord?.sentence_translation_uk && (
                    <Box className="exercise-fit-text__block">
                      <Typography className="exercise-fit-text__line">
                        {currentWord.sentence_translation_uk}
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
                            <span className="ms-1"><PronounceButton text={currentWord.sentence_text} /></span>
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
                            <span className="ms-1"><PronounceButton text={currentWord.word_text} /></span>
                          </span>
                        </Typography>
                      </Box>
                    );
                  })()}

                  {isRevealed && currentWord?.word_translation_uk && (
                    <Box className="exercise-fit-text__block">
                      <Typography className="exercise-fit-text__line">
                        {currentWord.word_translation_uk}
                      </Typography>
                    </Box>
                  )}
                  </Box>
                </Box>
              </Paper>
              </Box>
            </> : null}
          </>}
        </CircularLoading>
        </Box>

        <Box className='exercise-page-actions exercise-buttons-stack w-100 mt-3'>
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
                  Показати переклад
                </Button>
              ) : (
                <>
                  {isAuth && !currentWord?.isLearned && (
                    <Button
                      fullWidth
                      variant='contained'
                      color='success'
                      startIcon={<CheckIcon />}
                      onClick={onMarkLearnedClick}
                      disabled={isMarkingLearned}
                      className='exercise-btn-learned'
                    >
                      Позначити вивченим
                    </Button>
                  )}
                  <Box className='df gap-1' sx={{ width: '100%' }}>
                    <Button variant='contained' fullWidth color='success' onClick={onYesButtonClick}>Мій переклад правильний</Button>
                    <Button variant='contained' fullWidth color='error' onClick={onNoButtonClick}>Мій переклад неправильний</Button>
                  </Box>
                </>
              )}
            </>
          )}

          <Button
            component={Link}
            to={`/word-set/${id}`}
            onClick={onReturnButtonClick}
            variant='contained'
            color='warning'
            fullWidth
            startIcon={<ArrowBackIcon />}
            className='exercise-page-back'
          >
            Повернутися до набору
          </Button>
        </Box>
        </Box>

        <Toast {...toast} handleClose={handleCloseToast} />
      </Box>
    </>
  );
}
