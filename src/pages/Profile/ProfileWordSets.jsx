import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { selectIsAuth, selectAuthStatus } from '../../redux/slices/auth';
import { fetchWordSets } from '../../redux/slices/word-sets';

import WordSetCardGroup from '../../components/WordSetCardGroup';
import CircularLoading from '../../components/wrappers/CircularLoading';

export default function ProfileWordSets() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);

  if (!isAuth) {
    navigate('/');
  }

  const [ownWordSetsPage, setOwnWordSetsPage] = useState(1);
  const [savedWordSetsPage, setSavedWordSetsPage] = useState(1);
  
  const handleOwnWordSetsPageChange = (event, value) => {
    setOwnWordSetsPage(value);
  };

  const handleSavedWordSetsPageChange = (event, value) => {
    setSavedWordSetsPage(value);
  };

  const wordSetLimitPerPage = 8;

  const { items: ownWordSets, totalPages: ownWordSetsTotalPages, status: ownWordSetsStatus } = useSelector(state => state.wordSets.own);
  const { items: savedWordSets, totalPages: savedWordSetsTotalPages, status: savedWordSetsStatus } = useSelector(state => state.wordSets.saved);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchWordSets({ page: ownWordSetsPage, limit: wordSetLimitPerPage, filter: 'own' }));
    }
  }, [dispatch, ownWordSetsPage, isAuth]);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchWordSets({ page: savedWordSetsPage, limit: wordSetLimitPerPage, filter: 'saved' }));
    }
  }, [dispatch, savedWordSetsPage, isAuth]);
  

  return (
    <>
      <CircularLoading isLoading={authStatus === 'loading'}>
        {ownWordSets && (
          <>
            <WordSetCardGroup
              title={'Власні набори'}
              id='own-word-sets-block'
              mb={4}
              status={ownWordSetsStatus}
              wordSets={ownWordSets}
              count={ownWordSetsTotalPages}
              page={ownWordSetsPage}
              onChange={handleOwnWordSetsPageChange}
              limit={wordSetLimitPerPage} />
          </>
        )}

        {savedWordSets && (
          <>
            <WordSetCardGroup
              title={'Набори відмічені для вивчення'}
              status={savedWordSetsStatus}
              wordSets={savedWordSets}
              count={savedWordSetsTotalPages}
              page={savedWordSetsPage}
              onChange={handleSavedWordSetsPageChange}
              limit={wordSetLimitPerPage} />
          </>
        )}
      </CircularLoading>
    </>
  );
}