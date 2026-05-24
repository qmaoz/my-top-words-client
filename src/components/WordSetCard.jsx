import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import ProgressBar from './ProgressBar';
import { toggleWordSetSave } from '../redux/slices/word-sets';
import { selectIsAuth } from '../redux/slices/auth';
import { CircularProgress, Paper, Skeleton } from '@mui/material';
import WordSetName from './wrappers/WordSetName';
import CircularLoading from './wrappers/CircularLoading';
import SaveForLearningButton from './wrappers/SaveForLearningButton';


export default function WordSetCard({ id, totalWords, numWordsLearned, isSavedForLearning, link, title, isLoading }) {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);

  const handleToggleSave = () => {
    dispatch(toggleWordSetSave({ id }));
  }; 

  const wordSetCardBottomContent = !isLoading ? (isAuth ?
    <>
      <ProgressBar totalWords={totalWords} numWordsLearned={numWordsLearned}></ProgressBar>
      <SaveForLearningButton isSavedForLearning={isSavedForLearning} handleToggleSave={handleToggleSave} big />
    </>
    :
    <>Кількість слів: {totalWords}</>
  ) : '';

  return (
    <>
      {isLoading ? <>
        <Skeleton className='word-set-card' variant="rounded" width={210} height={60} />
      </> : <>
        <Paper elevation={2} className='word-set-card content-block rounded' sx={{ p: '1em', mt: '1em'}}>
          <CircularLoading isLoading={isLoading}>
            <div className="word-set-card__top">
              <WordSetName name={title} maxLength={30} link={link} />
            </div>
            <div className="word-set-card__bottom">
              {wordSetCardBottomContent}
            </div>
          </CircularLoading>

        </Paper>
      </>}
    </>
  );
}