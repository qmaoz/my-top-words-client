import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';

import { selectIsAuth, selectAuthStatus } from '../../../redux/slices/auth';
import { createNewWord } from '../../../redux/slices/words';
import { toggleIncludeWordInWordSet } from '../../../redux/slices/word-sets';
import FormInput from '../../../components/form/FormInput';
import { Toast } from '../../../components/utils/messages';
import CircularLoading from '../../../components/wrappers/CircularLoading';

export default function CreateNewWordForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeItem } = useSelector((state) => state.wordSets);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      word_text: '',
      word_translation_uk: '',
      sentence_text: '',
      sentence_translation_uk: '',
    },
    mode: 'onSubmit'
  });

  const onSubmitForm = async (values) => {
    try {
      const newWord = await dispatch(createNewWord(values)).unwrap();
      await dispatch(toggleIncludeWordInWordSet({ wordSetId: activeItem.id, wordId: newWord.id})).unwrap();
      setToast({ open: true, message: 'Слово успішно додано', severity: 'success' });
      reset();
    } catch (error) {
      setToast({ 
        open: true, 
        message: error.message || 'Виникла помилка при додаванні нового слова', 
        severity: 'error' 
      });
    }
  };
  
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  
  useEffect(() => {
    if (!isAuth && authStatus !== 'loading') {
      navigate('/');
    }
  }, [isAuth, authStatus, navigate]);

  return (
    <>
      <CircularLoading isLoading={authStatus === 'loading'}>
        <h3>Додати нове слово</h3>
        <form onSubmit={handleSubmit(onSubmitForm)} className="mb-3">
          <FormInput
            name="word_text"
            label="Слово"
            register={register}
            errors={errors}
            required fullWidth
            maxLength={255}
            disabled={!isAuth} />
          <FormInput
            name="word_translation_uk"
            label="Переклад"
            register={register}
            errors={errors}
            required fullWidth
            maxLength={255}
            disabled={!isAuth} />
          <FormInput
            name="sentence_text"
            label="Речення-приклад"
            register={register}
            errors={errors}
            required fullWidth
            maxLength={255}
            disabled={!isAuth} />
          <FormInput
            name="sentence_translation_uk"
            label="Переклад речення"
            register={register}
            errors={errors}
            required fullWidth
            maxLength={255}
            disabled={!isAuth} />
          <Button type='submit' className="mt-2" color='primary' variant='contained' disabled={!isAuth}>Додати</Button>
        </form>
      </CircularLoading>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}