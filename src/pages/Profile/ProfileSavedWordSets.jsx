import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { selectIsAuth, selectAuthStatus } from '../../redux/slices/auth';
import { fetchWordSets } from '../../redux/slices/word-sets';

import WordSetCardGroup from '../../components/WordSetCardGroup';
import CircularLoading from '../../components/wrappers/CircularLoading';
import useDebouncedValue from '../../components/utils/useDebouncedValue';
import { Toast } from '../../components/utils/messages';

export default function ProfileSavedWordSets() {
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

  const { items: savedWordSets, totalPages, status } = useSelector(state => state.wordSets.saved);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      if (!isAuth) return;
      const partOfName = searchQuery !== '' ? searchQuery : null;
      try {
        await dispatch(fetchWordSets({ page, limit, filter: 'saved', partOfName })).unwrap();
      } catch (error) {
        setToast({ open: true, message: error?.message?.message || error?.message || t('profile.loadError'), severity: 'error' });
      }
    })();
  }, [dispatch, page, limit, isAuth, searchQuery, t]);

  return (
    <>
      <CircularLoading isLoading={authStatus === 'loading'}>
        {savedWordSets && (
          <WordSetCardGroup
            status={status}
            wordSets={savedWordSets}
            count={totalPages}
            page={page}
            searchInputName="savedWordSetNameToSearch"
            onChange={(_event, value) => setPage(value)}
            limit={limit}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            emptyKey="wordSet.emptySaved"
          />
        )}
      </CircularLoading>
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
