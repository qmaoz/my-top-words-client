import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { selectIsAuth, selectAuthStatus } from '../../redux/slices/auth';
import { fetchWords } from '../../redux/slices/words';

import WordSearchBlock from '../../components/WordSearchBlock';
import CircularLoading from '../../components/wrappers/CircularLoading';

export default function ProfileWords() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  
  if (!isAuth) {
    navigate('/');
  }

  const [ownWordsPage, setOwnWordsPage] = useState(1);
  const [savedWordsPage, setSavedWordsPage] = useState(1);
  const [learnedWordsPage, setLearnedWordsPage] = useState(1);
  
  const handleOwnWordsPageChange = (event, value) => {
    setOwnWordsPage(value);
  };

  const handleSavedWordsPageChange = (event, value) => {
    setSavedWordsPage(value);
  };

  const handleLearnedWordsPageChange = (event, value) => {
    setLearnedWordsPage(value);
  };

  const wordLimitPerPage = 25;

  const { items: ownWords, totalPages: ownWordsTotalPages } = useSelector(state => state.words.own);
  const { items: savedWords, totalPages: savedWordsTotalPages } = useSelector(state => state.words.saved);
  const { items: learnedWords, totalPages: learnedWordsTotalPages } = useSelector(state => state.words.learned);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchWords({ page: ownWordsPage, limit: wordLimitPerPage, filter: 'own' }));
    }
  }, [dispatch, ownWordsPage, isAuth]);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchWords({ page: savedWordsPage, limit: wordLimitPerPage, filter: 'saved' }));
    }
  }, [dispatch, savedWordsPage, isAuth]);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchWords({ page: learnedWordsPage, limit: wordLimitPerPage, filter: 'learned' }));
    }
  }, [dispatch, learnedWordsPage, isAuth]);

  return (
    <>
      <CircularLoading isLoading={authStatus === 'loading'}>
        {ownWords && (
          <>
            <section className='mb-4'>
              <WordSearchBlock
                title='Власна лексика'
                count={ownWordsTotalPages}
                page={ownWordsPage}
                onChange={handleOwnWordsPageChange}
                words={ownWords} />
            </section>
          </>
        )}

        {savedWords && (
          <>
            <section className='mb-4'>
              <WordSearchBlock
                title='Відмічена для вивчення лексика'
                count={savedWordsTotalPages}
                page={savedWordsPage}
                onChange={handleSavedWordsPageChange}
                words={savedWords} />
            </section>
          </>
        )}

        {learnedWords && (
          <>
            <section>
              <WordSearchBlock
                title='Вивчена лексика'
                count={learnedWordsTotalPages}
                page={learnedWordsPage}
                onChange={handleLearnedWordsPageChange}
                words={learnedWords} />
            </section>
          </>
        )}
      </CircularLoading>
    </>
  );
}