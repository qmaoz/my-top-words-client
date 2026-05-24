import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Pagination, Stack } from '@mui/material';

import { WarningMessage, Toast } from './messages';
import WordSetTable from './WordSetTable';
import AddWordsDialog from './AddWordsDialog';
import { selectIsAuth, selectUserData } from '../redux/slices/auth';
import { deleteWord, fetchWords, updateWord } from '../redux/slices/words';
import { removeWordFromSet, updateWordSetWords } from '../redux/slices/word-sets';

// HERE: isEditing is not passed
export default function WordSearchBlock({ title, count, page, onChange, words, isEditing }) {
  const dispatch = useDispatch();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const isAuth = useSelector(selectIsAuth);
  const userData = useSelector(selectUserData);
  
  const { items: ownWords, totalPages: ownWordsTotalPages} = useSelector(state => state.words.own);
  const [ownWordsPage, setOwnWordsPage] = useState(1);
  const wordLimitPerPage = 25;
  
  const { activeItem, activeItemStatus } = useSelector((state) => state.wordSets);
  const isOwnWordSet = activeItem && userData && activeItem?.owner_user_id == userData?.id;

  useEffect(() => {
    if (isOwnWordSet) {
      dispatch(fetchWords({ page: ownWordsPage, limit: wordLimitPerPage, filter: 'own' }));
    }
  }, [dispatch, ownWordsPage, isOwnWordSet]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState([]);

  const toggleDialog = () => {
    if (!isDialogOpen) {
      const initialIds = activeItem?.words?.map(word => word.id) || [];
      setSelectedWordIds(initialIds);
      setIsDialogOpen(true);
    } else {
      setIsDialogOpen(false);
      setSelectedWordIds([]);
    }
  };
  
  const handleSave = async () => {
    try {
      await dispatch(updateWordSetWords({ 
        wordSetId: activeItem.id, 
        wordIds: selectedWordIds 
      })).unwrap();
      
      setToast({ open: true, message: 'Склад набору оновлено', severity: 'success' });
      toggleDialog();
    } catch (error) {
      setToast({ open: true, message: error?.message || 'Не вдалося оновити набір', severity: 'error' });
    }
  };

  const handleToggleWord = (id) => {
    setSelectedWordIds((prev) =>
      prev.includes(id) 
        ? prev.filter((wordId) => wordId !== id) 
        : [...prev, id]
    );
  };

  const handleUpdateWord = async (wordId, updatedData) => {
    try {
      await dispatch(updateWord({ id: wordId, ...updatedData })).unwrap();
      setToast({ open: true, message: 'Слово оновлено', severity: 'success' });
    } catch (err) {
      setToast({ open: true, message: 'Помилка оновлення', severity: 'error' });
    }
  };

  const handleRemoveFromSet = async (wordId) => {
    try {
      await dispatch(removeWordFromSet({ 
        wordSetId: activeItem.id, 
        wordId 
      })).unwrap();
      setToast({ open: true, message: 'Слово вилучено з набору', severity: 'info' });
    } catch (err) {
      setToast({ open: true, message: 'Не вдалося вилучити слово', severity: 'error' });
    }
  };

  const handleFullDelete = async (wordId) => {
    if (window.confirm('Ви впевнені? Слово буде видалено назавжди з усіх ваших наборів!')) {
      try {
        await dispatch(deleteWord(wordId)).unwrap();
        setToast({ open: true, message: 'Слово успішно видалено', severity: 'success' });
      } catch (err) {
        setToast({ open: true, message: 'Помилка при видаленні', severity: 'error' });
      }
    }
  };

  return (
    <>
      <h3>{title}</h3>

      {count > 1 && (
        <Stack spacing={2} sx={{ mt: 2, mb: 4, alignItems: 'center' }}>
          <Pagination
            count={count}
            page={page}
            onChange={onChange}
            color="primary"
            shape="rounded"
            size="large"
            disabled={activeItemStatus !== 'loaded'}
          />
        </Stack>
      )}

      <AddWordsDialog
        open={isDialogOpen}
        handleClose={toggleDialog}
        handleSave={handleSave}
        words={ownWords}
        selectedWordIds={selectedWordIds}
        onToggleWord={handleToggleWord} />

      <Box className='content-block' sx={{ boxShadow: 2 }}>
        {words?.length > 0 && <> {
          count > 1
            ? <h4>Кількість слів та виразів на поточній сторінці: {words?.length || 0}</h4>
            : <h4>Кількість слів та виразів: {words?.length || 0}</h4>
        }</>}
        
        {words?.length > 0 ? <>
          {isEditing && <>
            <Button variant='contained' color='primary' onClick={toggleDialog}>Редагувати вміст набору</Button>
          </>}
          <WordSetTable
            className='mt-2'
            words={words}
            isEditing={isEditing}
            // isProfilePage={isProfilePage} 
            isAuthorized={isAuth}
            isEditing={isEditing}
            onUpdate={handleUpdateWord}
            onRemoveFromSet={handleRemoveFromSet}
            onFullDelete={handleFullDelete}
          />
        </> : <>
          <WarningMessage message={'Немає лексики'} />
          {isEditing && <>
            <Button variant='contained' color='primary' onClick={toggleDialog} className='mt-2'>Додати слова в набір</Button>
          </>}
        </>}
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
} 