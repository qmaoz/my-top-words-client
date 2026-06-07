import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Pagination, Stack } from '@mui/material';

import { WarningMessage, Toast } from './utils/messages';
import WordSetTable from './WordSetTable';
import { selectIsAuth } from '../redux/slices/auth';
import { deleteWord, updateWord } from '../redux/slices/words';

export default function WordSearchBlock({ title, count: pageCount, words, isEditing }) {
  const dispatch = useDispatch();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const isAuth = useSelector(selectIsAuth);

  const handleUpdateWord = async (wordId, updatedData) => {
    try {
      await dispatch(updateWord({ id: wordId, ...updatedData })).unwrap();
      setToast({ open: true, message: 'Слово оновлено', severity: 'success' });
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || 'Помилка під час оновлення слова', severity: 'error' });
    }
  };

  const handleFullDelete = async (wordId) => {
    if (window.confirm('Підтверджуєте видалення слова?')) {
      try {
        await dispatch(deleteWord(wordId)).unwrap();
        setToast({ open: true, message: 'Слово успішно видалено', severity: 'success' });
      } catch {
        setToast({ open: true, message: 'Не вдалося видалити слово', severity: 'error' });
      }
    }
  };

  return (
    <>
      {title && title.trim() != '' && <h3>{title}</h3>}

      <Box className='content-block' sx={{ boxShadow: 2 }}>
        {words?.length > 0 && <> {
          pageCount > 1
            ? <h4>Кількість слів та виразів на поточній сторінці: {words?.length || 0}</h4>
            : <h4>Кількість слів та виразів: {words?.length || 0}</h4>
        }</>}
        
        {words?.length > 0 ? <>
          <WordSetTable
            className='mt-2'
            words={words}
            isEditing={isEditing}
            isAuthorized={isAuth}
            onUpdate={handleUpdateWord}
            onFullDelete={handleFullDelete}
          />
        </> : <>
          <WarningMessage message={'Немає лексики'} />
        </>}
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
} 