import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { Box } from '@mui/material';

import WordSetCardGroup from '../components/WordSetCardGroup';
import { fetchWordSets } from '../redux/slices/word-sets';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { isStateUpdateNeeded } from '../components/utils/functions';
import { Toast } from '../components/utils/messages';

export default function HomePage() {
  const { items: wordSets, totalPages, status } = useSelector(state => state.wordSets.top);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const [topWordSetNameToSearch, setTopWordSetNameToSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      topWordSetNameToSearch: '',
    },
    mode: 'onSubmit'
  });

  useEffect(() => {
    (async () => {
      const partOfName = topWordSetNameToSearch != '' ? topWordSetNameToSearch : null;
      try {
        await dispatch(fetchWordSets({ page, limit, filter: 'top', partOfName: partOfName })).unwrap();
      } catch (error) {
        setToast({ open: true, message: error?.message?.message || error?.message || t('home.loadError'), severity: 'error' });
      }
    })();
  }, [dispatch, page, limit, topWordSetNameToSearch]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const onSubmitSearchTopWordSetsForm = async (values) => {
    if (isStateUpdateNeeded(values?.topWordSetNameToSearch, topWordSetNameToSearch)) {
      setPage(1);
      setTopWordSetNameToSearch(values.topWordSetNameToSearch.trim());
    }
  };

  return (
    <>
      <Box className="container home-page">
        <h2>{t('home.title')}</h2>

        <WordSetCardGroup
          status={status}
          wordSets={wordSets}
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          limit={limit}
          searchInputName={'topWordSetNameToSearch'}
          register={register}
          handleSubmit={handleSubmit}
          onSubmitForm={onSubmitSearchTopWordSetsForm}
          errors={errors}/>

        <Toast {...toast} handleClose={handleCloseToast} />
      </Box>
    </>
  );
}