import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { selectIsAuth, selectAuthStatus } from '../../redux/slices/auth';
import { fetchWordSets } from '../../redux/slices/word-sets';

import WordSetCardGroup from '../../components/WordSetCardGroup';
import CircularLoading from '../../components/wrappers/CircularLoading';
import CreateNewWordSetForm from './components/CreateNewWordSetForm';
import { isStateUpdateNeeded } from '../../components/utils/functions';
import { Toast } from '../../components/utils/messages';

export default function ProfileOwnWordSets() {
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

  const [ownWordSetsPage, setOwnWordSetsPage] = useState(1);
  const [ownWordSetNameToSearch, setOwnWordSetNameToSearch] = useState('');
  
  const handleOwnWordSetsPageChange = (event, value) => {
    setOwnWordSetsPage(value);
  };

  const wordSetLimitPerPage = 8;

  const { items: ownWordSets, totalPages: ownWordSetsTotalPages, status: ownWordSetsStatus } = useSelector(state => state.wordSets.own);

  useEffect(() => {
    (async () => {
      if (isAuth) {
        const partOfName = ownWordSetNameToSearch != '' ? ownWordSetNameToSearch : null;
        try {
          await dispatch(fetchWordSets({ page: ownWordSetsPage, limit: wordSetLimitPerPage, filter: 'own', partOfName: partOfName })).unwrap();
        } catch (error) {
          setToast({ open: true, message: error?.message?.message || error?.message || 'Не вдалося завантажити Ваші набори', severity: 'error' });
        }
      }
    })();
  }, [dispatch, ownWordSetsPage, wordSetLimitPerPage, isAuth, ownWordSetNameToSearch]);

  const { register: registerOwnWordSetToSearch, handleSubmit: handleSubmitOwnWordSetToSearch, formState: { errors: errorsOwnWordSetToSearch } } = useForm({
    defaultValues: {
      ownWordSetNameToSearch: '',
    },
    mode: 'onSubmit'
  });

  const onSubmitSearchOwnWordSetsForm = async (values) => {
    if (isAuth && isStateUpdateNeeded(values?.ownWordSetNameToSearch, ownWordSetNameToSearch)) {
      setOwnWordSetsPage(1);
      setOwnWordSetNameToSearch(values.ownWordSetNameToSearch.trim());
    }
  };

  return (
    <>
      <CircularLoading isLoading={authStatus === 'loading'}>
        <CreateNewWordSetForm className='mt-4 mb-5' />

        {ownWordSets && (
          <>
            <WordSetCardGroup
              title={'Власні набори'}
              status={ownWordSetsStatus}
              wordSets={ownWordSets}
              count={ownWordSetsTotalPages}
              page={ownWordSetsPage}
              searchInputName={'ownWordSetNameToSearch'}
              onChange={handleOwnWordSetsPageChange}
              limit={wordSetLimitPerPage}
              className='mt-4'
              register={registerOwnWordSetToSearch}
              handleSubmit={handleSubmitOwnWordSetToSearch}
              onSubmitForm={onSubmitSearchOwnWordSetsForm}
              errors={errorsOwnWordSetToSearch}/>
          </>
        )}
      </CircularLoading>
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}