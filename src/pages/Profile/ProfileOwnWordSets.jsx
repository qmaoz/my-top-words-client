import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { selectIsAuth, selectAuthStatus } from '../../redux/slices/auth';
import { fetchWordSets } from '../../redux/slices/word-sets';

import WordSetCardGroup from '../../components/WordSetCardGroup';
import CircularLoading from '../../components/wrappers/CircularLoading';
import CreateNewWordSetForm from './components/CreateNewWordSetForm';
import useDebouncedValue from '../../components/utils/useDebouncedValue';
import { Toast } from '../../components/utils/messages';

export default function ProfileOwnWordSets() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    if (!isAuth && authStatus !== 'loading') {
      navigate('/');
    }
  }, [isAuth, authStatus, navigate]);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useDebouncedValue(searchInput.trim());
  const limit = 8;

  const { items: ownWordSets, totalPages, status } = useSelector(state => state.wordSets.own);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      if (!isAuth) return;
      const partOfName = searchQuery !== '' ? searchQuery : null;
      try {
        await dispatch(fetchWordSets({ page, limit, filter: 'own', partOfName })).unwrap();
      } catch (error) {
        setToast({ open: true, message: error?.message?.message || error?.message || t('profile.loadError'), severity: 'error' });
      }
    })();
  }, [dispatch, page, limit, isAuth, searchQuery, t]);

  const handleDeleted = () => {
    if (ownWordSets.length <= 1 && page > 1) {
      setPage((current) => current - 1);
      return;
    }
    const partOfName = searchQuery !== '' ? searchQuery : null;
    dispatch(fetchWordSets({ page, limit, filter: 'own', partOfName }));
  };

  return (
    <>
      <CircularLoading isLoading={authStatus === 'loading'}>
        <CreateNewWordSetForm />

        {ownWordSets && (
          <WordSetCardGroup
            status={status}
            wordSets={ownWordSets}
            count={totalPages}
            page={page}
            searchInputName="ownWordSetNameToSearch"
            onChange={(_event, value) => setPage(value)}
            limit={limit}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            showSave={false}
            canDelete
            onDeleted={handleDeleted}
          />
        )}
      </CircularLoading>
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
