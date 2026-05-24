import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import WordSearchBlock from '../components/WordSearchBlock';
import WordSetCard from '../components/WordSetCard';
import WordSetCardGroup from '../components/WordSetCardGroup';

import { fetchWordSets } from '../redux/slices/word-sets';
import { useState } from 'react';

export default function HomePage() {
  const { items: wordSets, totalPages, status } = useSelector(state => state.wordSets.all);
  
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    dispatch(fetchWordSets({ page, limit }));
  }, [dispatch, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      <div className="container">
        <h2>Топ спільних наборів лексики</h2>

        <WordSetCardGroup
          status={status}
          wordSets={wordSets}
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          limit={limit} />

        {/* <h2>Знайдіть лексику, яка Вас цікавить</h2> */}
        {/* <WordSearchBlock /> */}
      </div>
    </>
  );
}