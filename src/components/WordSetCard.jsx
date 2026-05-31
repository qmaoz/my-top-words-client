import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Paper, Skeleton } from '@mui/material';

import ProgressBar from './ProgressBar';
import { toggleWordSetSave } from '../redux/slices/word-sets';
import { selectIsAuth } from '../redux/slices/auth';
import WordSetName from './wrappers/WordSetName';
import CircularLoading from './wrappers/CircularLoading';
import SaveForLearningButton from './wrappers/SaveForLearningButton';
import { correctNounCase } from './utils/functions';
import { useState } from 'react';
import { Toast } from './utils/messages';


export default function WordSetCard({ id, totalWords, isSavedForLearning, link, title, isLoading }) {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const handleToggleSave = async () => {
    try {
      dispatch(toggleWordSetSave({ id })).unwrap();
    } catch (error) {
      setToast({ open: true, message: error?.message || 'Помилка під час збереження або скасування збереження набору', severity: 'error' });
    }
  };

  const numberOfWords = `${totalWords} ${correctNounCase(totalWords, 'слово', 'слова', 'слів')} в наборі`;

  const wordSetCardBottomContent = isAuth ? <>
    <p className='m-0'>{numberOfWords}</p>
    <SaveForLearningButton isSavedForLearning={isSavedForLearning} handleToggleSave={handleToggleSave} big />
  </> : <>
    <p className='m-0'>{numberOfWords}</p>
  </>;

  return (
    <>
      {isLoading ? <>
        <Skeleton animation="wave" variant="rounded" width={'100%'} height={230} />
      </> : <>
        <Paper elevation={2} className='word-set-card content-block rounded p-3'>
          <CircularLoading isLoading={isLoading}>
            <Box className="word-set-card__top">
              <WordSetName name={title} maxLength={30} link={link} />
            </Box>
            <Box className="word-set-card__bottom">
              {wordSetCardBottomContent}
            </Box>
          </CircularLoading>
        </Paper>
      </>}

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}