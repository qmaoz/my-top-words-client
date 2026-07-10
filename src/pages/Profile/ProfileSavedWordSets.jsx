import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { selectIsAuth, selectAuthStatus } from '../../redux/slices/auth';
import { fetchWordSets } from '../../redux/slices/word-sets';

import { Box, Typography } from '@mui/material';
import WordSetCardGroup from '../../components/WordSetCardGroup';
import CircularLoading from '../../components/wrappers/CircularLoading';
import CreateNewWordSetForm from './components/CreateNewWordSetForm';
import { isStateUpdateNeeded } from '../../components/utils/functions';
import { Toast } from '../../components/utils/messages';

export default function ProfileSavedWordSets() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    if (!isAuth && authStatus !== 'loading') {
      navigate('/');
    }
  }, [isAuth, authStatus, navigate]);

  const [savedWordSetsPage, setSavedWordSetsPage] = useState(1);
  const [savedWordSetNameToSearch, setSavedWordSetNameToSearch] = useState('');
  
  const handleSavedWordSetsPageChange = (event, value) => {
    setSavedWordSetsPage(value);
  };

  const wordSetLimitPerPage = 8;

  const { items: savedWordSets, totalPages: savedWordSetsTotalPages, status: savedWordSetsStatus } = useSelector(state => state.wordSets.saved);

  useEffect(() => {
    (async () => {
      if (isAuth) {
        const partOfName = savedWordSetNameToSearch != '' ? savedWordSetNameToSearch : null;
        try {
          await dispatch(fetchWordSets({ page: savedWordSetsPage, limit: wordSetLimitPerPage, filter: 'saved', partOfName: partOfName })).unwrap();
        } catch (error) {
          setToast({ open: true, message: error?.message?.message || error?.message || 'Не вдалося завантажити Ваші набори', severity: 'error' });
        }
      }
    })();
  }, [dispatch, savedWordSetsPage, wordSetLimitPerPage, isAuth, savedWordSetNameToSearch]);

  const { register: registerSavedWordSetToSearch, handleSubmit: handleSubmitSavedWordSetToSearch, formState: { errors: errorsSavedWordSetToSearch } } = useForm({
    defaultValues: {
      savedWordSetNameToSearch: '',
    },
    mode: 'onSubmit'
  });

  const onSubmitSearchSavedWordSetsForm = async (values) => {
    if (isAuth && isStateUpdateNeeded(values?.savedWordSetNameToSearch, savedWordSetNameToSearch)) {
      setSavedWordSetsPage(1);
      setSavedWordSetNameToSearch(values.savedWordSetNameToSearch.trim());
    }
  };

  return (
    <>
      <CircularLoading isLoading={authStatus === 'loading'}>
        {savedWordSets && (
          <>
            <Typography className="profile-section-intro" color="text.secondary">
              Набори інших авторів, які Ви зберегли до себе.
            </Typography>
            <WordSetCardGroup
              title={'Збережені набори'}
              status={savedWordSetsStatus}
              wordSets={savedWordSets}
              count={savedWordSetsTotalPages}
              page={savedWordSetsPage}
              searchInputName={'savedWordSetNameToSearch'}
              onChange={handleSavedWordSetsPageChange}
              limit={wordSetLimitPerPage}
              className='mt-4'
              register={registerSavedWordSetToSearch}
              handleSubmit={handleSubmitSavedWordSetToSearch}
              onSubmitForm={onSubmitSearchSavedWordSetsForm}
              errors={errorsSavedWordSetToSearch}/>
          </>
        )}
      </CircularLoading>
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}