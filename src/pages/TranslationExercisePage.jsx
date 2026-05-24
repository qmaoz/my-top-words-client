import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Alert, Box, Button, Container, Paper, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import { fetchWordSet } from '../redux/slices/word-sets';
import ProgressBar from '../components/ProgressBar';
import PronounceButton from '../components/wrappers/PronounceButton';
import { speakText } from '../components/functions';
import CircularLoading from '../components/wrappers/CircularLoading';
import { ErrorMessage } from '../components/messages';

// HERE: check for:
// - no words in the list
// - one word in the list
export default function TranslationExercisePage() {
  // console.clear();
  const isDebug = false;
  const { id } = useParams();
  const dispatch = useDispatch();
  const { activeItem, activeItemStatus } = useSelector((state) => state.wordSets);
  const [answer, setAnswer] = useState(null); // null / 'yes' / 'no'
  const [wordsQueue, setWordsQueue] = useState([]);
  // first reload
  // const [wordsQueue, setWordsQueue] = useState(
  //   activeItem?.words.map(word => {
  //     return { id: word.id, repeatNumber: 0, repeatAfter: 0 };
  //   })
  // );

  useEffect(() => {
    if (activeItem?.words && wordsQueue.length === 0) {
      const initialQueue = activeItem.words.map(word => ({
        id: word.id, 
        repeatNumber: 0, 
        repeatAfter: 0 
      }));
      setWordsQueue(initialQueue);
    }
  }, [activeItem, wordsQueue.length]);

  // console.log('wordsQueue: ', wordsQueue);
  // console.log('activeItem?.words: ', activeItem?.words);

  const getNextWordIndex = () => {
    // first word with minimal "repeatAfter" value
    let nextWord = wordsQueue[0];
    for (let i = 0; i < wordsQueue?.length; i++) {
      // HERE: check for getting out of range
      const wordInList = wordsQueue[i];

      if (nextWord.repeatAfter > wordInList.repeatAfter || nextWord.repeatAfter == null) {
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
  // console.log('currentWordIndex: ', currentWordIndex);
  
  const [currentWord, setCurrentWord] = useState(null);
  useEffect(() => {
    if (activeItem?.words && currentWord == null) {
      setCurrentWord(activeItem?.words.find(word => word.id == currentWordIndex));
    }
  }, [activeItem, currentWord, currentWordIndex]);
  // console.log('currentWord: ', currentWord);

  useEffect(() => {
    // if the data is already in `activeItem` and it's the same set, there's no need to load it again
    if (!activeItem || activeItem.id !== Number(id)) {
      dispatch(fetchWordSet(id));
    }
  }, [id, dispatch, activeItem]);

  

  // if okay:
  // - increase repeatNumber of the curent element by one;
  // - (repeatNumber is already increased) set repeatAfter value:
  //   - 1 if repeatNumber == 1;
  //   - 4 if repeatNumber == 2;
  //   - null if repeatNumber >= 3;
  // - decrease the "repeatAfter" value by one for all other elements;
  const onYesButtonClick = () => {
    setAnswer('yes');
    speakText(currentWord?.sentence_text);

    // increase the repeatNumber value of the curent element by one
    // update the repeatAfter value
    const newWordsQueue = wordsQueue.map(word => {
      if (word.id == currentWordIndex) {
        let repeatNumber = word.repeatNumber + 1;
        let repeatAfter;
        if (repeatNumber == 1) repeatAfter = 1;
        if (repeatNumber == 2) repeatAfter = 4;
        if (repeatNumber >= 3) {
          repeatAfter = null;
          if (repeatNumber == 3) {
            // update status in DataBase if needed
            // ...
          }
        }

        return {...word, repeatNumber: repeatNumber, repeatAfter: repeatAfter};
      } else {
        // decrease the "repeatAfter" value by one for all other elements;
        let repeatAfter = word.repeatAfter > 0 ? word.repeatAfter - 1 : word.repeatAfter;
        return {...word, repeatAfter: repeatAfter};
      }
    });

    setWordsQueue(newWordsQueue);
  };

  // if error:
  // - repeatNumber of the current element = 0;
  // - do not update the "repeatAfter" value for other elements; 
  const onNoButtonClick = () => {
    setAnswer('no');
    speakText(currentWord?.sentence_text);
    // console.log('wordsQueue: ', wordsQueue);
    // console.log('activeItem?.words: ', activeItem?.words);
    // console.log('currentWord: ', currentWord);
    
    const newWordsQueue = wordsQueue.map(word => {
      if (word.id == currentWordIndex) {
        return {...word, repeatNumber: 0};
      } else {
        return {...word};
      }
    });
    
    setWordsQueue(newWordsQueue);
  };

  const onNextButtonClick = () => {
    // console.log('wordsQueue: ', wordsQueue);
    window.speechSynthesis.cancel();
    setAnswer(null);
    const nextWordIndex = getNextWordIndex();
    setCurrentWordIndex(nextWordIndex);
    setCurrentWord(activeItem?.words.find(word => word.id == nextWordIndex));
  };

  return (
    <>
      <Container className='app-container p-3'>
        <CircularLoading isLoading={activeItemStatus === 'loading'}>
          {!activeItem ? (
            <ErrorMessage message={'Набір не знайдено або доступ до нього заборонено'} />
          ) : <>
            {activeItem?.words && activeItem.words.length === 0 ? <>
              <ErrorMessage message={'Набір порожній'} />
            </> : <>
              <Box className='df aic jcsb gap-3'>
                <span className='text-nowrap'>Кількість закріплених слів:</span>
                <ProgressBar totalWords={wordsQueue?.length} numWordsLearned={wordsQueue?.filter(word => word.repeatNumber >= 3).length} />
              </Box>
              {isDebug && <>
                <p style={{fontSize: '0.5em', margin: 0}}>
                  Answer: {answer}; | currentWordIndex: {currentWordIndex};<br />
                  currentWord.id: {currentWord?.id};
                </p>
                {wordsQueue?.map(word => {
                  return <Fragment key={word.id}>
                    <p style={{fontSize: '0.5em', margin: 0}}>id: {word.id} | repeatNumber: {word.repeatNumber} | repeatAfter: {word.repeatAfter} | {activeItem?.words.find(wordData => wordData.id == word.id).sentence_text}</p>
                  </Fragment>;
                })}
              </>}
              <Paper elevation={2} className='main-content' sx={{ p: '1em', mt: '1em'}}>
                {currentWord?.sentence_translation_uk &&
                  <Typography variant='body1'>{currentWord?.sentence_translation_uk}</Typography>
                }
                {!answer &&
                  <Box className='df aic gap-3 mt-3'>
                    <Typography variant='body1' className='text-nowrap'>Чи легко відтворити це речення німецькою?</Typography>
                  </Box>
                }
                {answer &&
                  <>
                    <Box className='mt-3 df aic gap-1'>
                      <Typography variant='body1'>{currentWord?.sentence_text}</Typography>
                      <PronounceButton text={currentWord?.sentence_text} />
                    </Box>
                    <Box className='df aic mt-3'>
                      <Box className='df aic gap-1'>
                        <Typography variant='body2'>{currentWord?.word_text}</Typography>
                        <PronounceButton text={currentWord?.word_text} />
                      </Box>
                      <Typography variant='body2' className=''>— {currentWord?.word_translation_uk}</Typography>
                    </Box>
                  </>
                }
              </Paper>
              <Box className='df aic gap-3 mt-3'>
                {!answer ? <>
                  <Button variant='contained' fullWidth color='success' onClick={onYesButtonClick}>Так</Button>
                  <Button variant='contained' fullWidth color='error' onClick={onNoButtonClick}>Ні</Button>
                </> : <>
                  {wordsQueue?.filter(word => word.repeatNumber < 3).length == 0 ? <>
                    <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" className='text-nowrap'>
                      Вітаємо! Набір повністю пройдено!
                    </Alert>
                    <Link to={`/word-set/${id}`} className='w-100'>
                      <Button onClick={onNextButtonClick} variant='contained' fullWidth color='primary'>
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
      </Container>
    </>
  );
}