import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import { fetchWordSet } from '../redux/slices/word-sets';
import ProgressBar from '../components/ProgressBar';
import PronounceButton from '../components/wrappers/PronounceButton';
import { speakText } from '../components/utils/functions';
import CircularLoading from '../components/wrappers/CircularLoading';
import { ErrorMessage, Toast } from '../components/utils/messages';
import useFitText from '../components/utils/useFitText';

export default function TranslationExercisePage() {
  const isDebug = false;
  const { id } = useParams();
  const dispatch = useDispatch();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const { activeItem, activeItemStatus } = useSelector((state) => state.wordSets);
  const [answer, setAnswer] = useState(null); // null / 'yes' / 'no'
  const [wordsQueue, setWordsQueue] = useState([]);
  const [wordsQueueSnapshot, setWordsQueueSnapshot] = useState(null); // for undo

  useEffect(() => {
    if (activeItem?.words && wordsQueue.length === 0) {
      const initialQueue = activeItem.words.map(word => ({
        id: word.id, 
        correctRepeatNumber: 0,
        totalRepeatNumber: 0,
        repeatAfter: 0,
      }));
      setWordsQueue(initialQueue);
    }
  }, [activeItem, wordsQueue.length]);


  const getNextWordIndex = () => {
    // get the first word with the minimal "repeatAfter" value
    let nextWord = wordsQueue[0];
    for (let i = 0; i < wordsQueue?.length; i++) {
      const wordInList = wordsQueue[i];

      if (nextWord.repeatAfter == null || nextWord.repeatAfter > wordInList.repeatAfter && wordInList.repeatAfter != null) {
        nextWord = wordInList;
      }
    }

    return nextWord.id;
  };

  const [currentWordIndex, setCurrentWordIndex] = useState(null);
  useEffect(() => {
    if (wordsQueue && currentWordIndex == null) {
      setCurrentWordIndex(wordsQueue[0]?.id);
    }
  }, [wordsQueue, currentWordIndex]);
  
  const [currentWord, setCurrentWord] = useState(null);
  useEffect(() => {
    if (activeItem?.words && currentWord == null) {
      setCurrentWord(activeItem?.words.find(word => word.id == currentWordIndex));
    }
  }, [activeItem, currentWord, currentWordIndex]);

  useEffect(() => {
    (async () => {
      // if the data is already in `activeItem` and it's the same wordSet, there's no need to load it again
      if (!activeItem || activeItem.id !== Number(id)) {
        try {
          await dispatch(fetchWordSet(id)).unwrap();
        } catch (error) {
          setToast({ open: true, message: error?.message?.message || error?.message || 'Помилка під час завантаження набору', severity: 'error' });
        }
        
      }
    })();
  }, [id, dispatch, activeItem]);

  

  // if okay:
  // - increase correctRepeatNumber of the curent element by one;
  // - (correctRepeatNumber is already increased) set repeatAfter value:
  //   - 1 if correctRepeatNumber == 1;
  //   - 4 if correctRepeatNumber == 2;
  //   - null if correctRepeatNumber >= 3 or word is repeated correct for the first time (no need to repeat again);
  // - decrease the "repeatAfter" value by one for all other elements;
  const onYesButtonClick = () => {
    setAnswer('yes');
    speakText(currentWord?.sentence_text);

    // save snapshot for undo
    setWordsQueueSnapshot([...wordsQueue]);

    // increase the correctRepeatNumber value of the curent element by one
    // update the repeatAfter value
    const newWordsQueue = wordsQueue.map(word => {
      if (word.id == currentWordIndex) {
        if (word.totalRepeatNumber == 1 && word.repeatAfter == null) {
          return { ...word };
        }

        let totalRepeatNumber = word.totalRepeatNumber + 1;
        let correctRepeatNumber = word.correctRepeatNumber + 1;
        let repeatAfter;
        if (correctRepeatNumber >= 3 || totalRepeatNumber == 1) {
          repeatAfter = null;
        } else {
          if (correctRepeatNumber == 1) repeatAfter = 1;
          if (correctRepeatNumber == 2) repeatAfter = 4;
        }

        return { ...word, correctRepeatNumber: correctRepeatNumber, repeatAfter: repeatAfter, totalRepeatNumber: totalRepeatNumber };
      } else {
        // decrease the "repeatAfter" value by one for all other elements;
        let repeatAfter = word.repeatAfter > 0 ? word.repeatAfter - 1 : word.repeatAfter;
        return { ...word, repeatAfter: repeatAfter };
      }
    });

    setWordsQueue(newWordsQueue);
  };

  // if error:
  // - correctRepeatNumber of the current element = 0;
  // - do not update the "repeatAfter" value for other elements; 
  const onNoButtonClick = () => {
    setAnswer('no');
    speakText(currentWord?.sentence_text);
    
    const newWordsQueue = wordsQueue.map(word => {
      if (word.id == currentWordIndex) {
        let totalRepeatNumber = word.totalRepeatNumber + 1;
        return { ...word, correctRepeatNumber: 0, totalRepeatNumber: totalRepeatNumber };
      } else {
        return { ...word };
      }
    });
    
    setWordsQueue(newWordsQueue);
  };

  const onUndoButtonClick = () => {
    if (wordsQueueSnapshot) {
      setWordsQueue(wordsQueueSnapshot);
      setWordsQueueSnapshot(null);
    }
    setAnswer(null);
    window.speechSynthesis.cancel();
  };

  const onNextButtonClick = () => {
    window.speechSynthesis.cancel();
    setAnswer(null);
    setWordsQueueSnapshot(null);
    const nextWordIndex = getNextWordIndex();
    setCurrentWordIndex(nextWordIndex);
    setCurrentWord(activeItem?.words.find(word => word.id == nextWordIndex));
  };

  const onReturnButtonClick = () => {
    window.speechSynthesis.cancel();
  };

  const { ref: cardRef } = useFitText({ currentWord, answer }, { max: 2.5, min: 0.6 });

  return (
    <>
      <Box className='app-container container p-3 exercise-page-content'>
        <CircularLoading isLoading={activeItemStatus === 'loading'}>
          {!activeItem ? (
            <ErrorMessage message={'Набір не знайдено або доступ до нього заборонено, або стався збій'} />
          ) : <>
            {activeItem?.words && activeItem.words.length === 0 ? <>
              <ErrorMessage message={'Набір порожній'} />
            </> : <>
              <Box className='df gap-3'>
                <span className='text-nowrap'>Кількість закріплених слів:</span>
                <ProgressBar total={wordsQueue?.length} completed={wordsQueue?.filter(word => word.repeatAfter == null).length} />
              </Box>
              {isDebug && <>
                <p style={{fontSize: '0.5em', margin: 0}}>
                  Answer: {answer}; | currentWordIndex: {currentWordIndex};<br />
                  currentWord.id: {currentWord?.id};
                </p>
                {wordsQueue?.map(word => {
                  return <Fragment key={word.id}>
                    <p style={{fontSize: '0.5em', margin: 0}}>id: {word.id} | correctRepeatNumber: {word.correctRepeatNumber} | repeatAfter: {word.repeatAfter} | totalRepeatNumber: {word.totalRepeatNumber} | {activeItem?.words.find(wordData => wordData.id == word.id).sentence_text}</p>
                  </Fragment>;
                })}
              </>}
              <Paper elevation={2} className='main-content content-block' sx={{ p: '1em', mt: '1em', display: 'flex', flexDirection: 'column' }}>
                <Box ref={cardRef} sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Row 1: Ukrainian sentence */}
                  {currentWord?.sentence_translation_uk && (
                    <Box>
                      <Typography sx={{ fontSize: 'inherit' }}>
                        {currentWord?.sentence_translation_uk}
                      </Typography>
                    </Box>
                  )}

                  {/* Row 2: German sentence (appears after answer) */}
                  {answer && currentWord?.sentence_text && (() => {
                    const words = currentWord.sentence_text.split(' ');
                    const lastWord = words.pop();
                    return (
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontSize: 'inherit' }}>
                          {words.join(' ')}{words.length > 0 && ' '}
                          <span style={{ whiteSpace: 'nowrap' }}>
                            {lastWord}
                            <span className='ms-1'><PronounceButton text={currentWord?.sentence_text} /></span>
                          </span>
                        </Typography>
                      </Box>
                    );
                  })()}

                  {/* Row 3: German word (appears after answer) */}
                  {answer && currentWord?.word_text && (() => {
                    const words = currentWord.word_text.split(' ');
                    const lastWord = words.pop();
                    return (
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontSize: 'inherit' }}>
                          {words.join(' ')}{words.length > 0 && ' '}
                          <span style={{ whiteSpace: 'nowrap' }}>
                            {lastWord}
                            <span className='ms-1'><PronounceButton text={currentWord?.word_text} /></span>
                          </span>
                        </Typography>
                      </Box>
                    );
                  })()}

                  {/* Row 4: Ukrainian translation (appears after answer) */}
                  {answer && currentWord?.word_translation_uk && (
                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ fontSize: 'inherit' }}>
                        {currentWord?.word_translation_uk}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Query phrase - below the card, near buttons */}
              {!answer && (
                <Box className='df mt-3'>
                  <Typography variant='body1'>
                    Чи легко відтворити це речення німецькою?
                  </Typography>
                </Box>
              )}

              <Box className='df gap-3 mt-3'>
                {!answer ? <>
                  <Button variant='contained' fullWidth color='success' onClick={onYesButtonClick}>Так</Button>
                  <Button variant='contained' fullWidth color='error' onClick={onNoButtonClick}>Ні</Button>
                </> : <>
                  {wordsQueue?.filter(word => word.repeatAfter != null).length == 0 ? <>
                    <p className='text-nowrap m-0'>
                      Тренажер успішно пройдено!
                    </p>
                    <Link to={`/word-set/${id}`} className='w-100'>
                      <Button onClick={onReturnButtonClick} variant='contained' fullWidth color='primary'>
                        Повернутися до набору
                      </Button>
                    </Link>
                  </> : <>
                    <Box className='w-100 exercise-buttons-stack' sx={{ display: 'flex', gap: 1 }}>
                      {answer === 'yes' && (
                        <Button fullWidth variant='outlined' color='warning' onClick={onUndoButtonClick} className='exercise-btn-cancel'>
                          Скасувати
                        </Button>
                      )}
                      <Button onClick={onNextButtonClick} variant='contained' fullWidth color='primary' className='exercise-btn-next'>Далі</Button>
                    </Box>
                  </>}
                </>}
              </Box>
            </>}
          </>}
        </CircularLoading>

        <Toast {...toast} handleClose={handleCloseToast} />
      </Box>
    </>
  );
}