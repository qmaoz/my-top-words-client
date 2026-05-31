import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { Box } from '@mui/material';

import WordSetCardGroup from '../components/WordSetCardGroup';
import { fetchWordSets } from '../redux/slices/word-sets';
import { useForm } from 'react-hook-form';
import { isStateUpdateNeeded } from '../components/utils/functions';

export default function HomePage() {
  const { items: wordSets, totalPages, status } = useSelector(state => state.wordSets.top);
  const dispatch = useDispatch();

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
    const partOfName = topWordSetNameToSearch != '' ? topWordSetNameToSearch : null;
    dispatch(fetchWordSets({ page, limit, filter: 'top', partOfName: partOfName }));
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
      <Box className="container">
        <h2>Топ спільних наборів лексики</h2>

        <WordSetCardGroup
          status={status}
          wordSets={wordSets}
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          limit={limit}
          searchInputName={'topWordSetNameToSearch'}
          className='mt-4'
          register={register}
          handleSubmit={handleSubmit}
          onSubmitForm={onSubmitSearchTopWordSetsForm}
          errors={errors}/>
      </Box>
    </>
  );
}