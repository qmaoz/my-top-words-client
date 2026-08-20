import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import HomeAbout from '../components/HomeAbout';
import WordSetCardGroup from '../components/WordSetCardGroup';
import { fetchWordSets } from '../redux/slices/word-sets';
import { selectIsAuth } from '../redux/slices/auth';
import useDebouncedValue from '../components/utils/useDebouncedValue';
import { Toast } from '../components/utils/messages';

export default function HomePage() {
  const { items: wordSets, totalPages, status } = useSelector(state => state.wordSets.top);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isAuth = useSelector(selectIsAuth);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      const partOfName = searchQuery !== '' ? searchQuery : null;
      try {
        await dispatch(fetchWordSets({ page, limit, filter: 'top', partOfName })).unwrap();
      } catch (error) {
        setToast({ open: true, message: error?.message?.message || error?.message || t('home.loadError'), severity: 'error' });
      }
    })();
  }, [dispatch, page, limit, searchQuery, t]);

  return (
    <>
      <Box className="container home-page">
        {!isAuth && <HomeAbout />}
        <h2 id="home-sets">{t('home.title')}</h2>

        <WordSetCardGroup
          status={status}
          wordSets={wordSets}
          count={totalPages}
          page={page}
          onChange={(_event, value) => setPage(value)}
          limit={limit}
          searchInputName="topWordSetNameToSearch"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          showSave={isAuth}
        />

        <Toast {...toast} handleClose={handleCloseToast} />
      </Box>
    </>
  );
}
