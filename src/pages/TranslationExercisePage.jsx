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

export default function TranslationExercisePage() {
  const isDebug = false;
  const { id } = useParams();
  const dispatch = useDispatch();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const { activeItem, activeItemStatus } = useSelector((state) => state.wordSets);
  const [answer, setAnswer] = useState(null); // null / 'yes' / 'no'
  const [wordsQueue, setWordsQueue] = useState([]);

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

  const onNextButtonClick = () => {
    window.speechSynthesis.cancel();
    setAnswer(null);
    const nextWordIndex = getNextWordIndex();
    setCurrentWordIndex(nextWordIndex);
    setCurrentWord(activeItem?.words.find(word => word.id == nextWordIndex));
  };

  const onReturnButtonClick = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <>
      <Box className='app-container container p-3'>
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
              <Paper elevation={2} className='main-content content-block' sx={{ p: '1em', mt: '1em'}}>
                {currentWord?.sentence_translation_uk && <>
                  <Box>
                    <Typography variant='body1'>
                      {currentWord?.sentence_translation_uk && <span>{currentWord?.sentence_translation_uk}</span>}
                      {answer && currentWord?.sentence_text && <>
                        <span className='me-1 ms-1'>—</span>
                        <span>{currentWord?.sentence_text}</span>
                        <span className='ms-1'><PronounceButton text={currentWord?.sentence_text} /></span>
                      </>} 
                    </Typography>
                  </Box>
                </>
                }
                {!answer &&
                  <Box className='df gap-3 mt-3'>
                    <Typography variant='body1' className='text-nowrap'>Чи легко відтворити це речення німецькою?</Typography>
                  </Box>
                }
                {answer &&
                  <>
                    <Typography variant='body2'>
                      <span>{currentWord?.word_text}</span>
                      <span className='ms-1'><PronounceButton text={currentWord?.word_text} /></span>
                      <span className='me-1'>—</span>
                      <span className=''>{currentWord?.word_translation_uk}</span>
                    </Typography>
                  </>
                }
              </Paper>
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
                  </>: <>
                    <Button onClick={onNextButtonClick} variant='contained' fullWidth color='primary'>Далі</Button>
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