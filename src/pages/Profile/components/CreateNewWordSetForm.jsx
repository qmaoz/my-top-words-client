import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { useForm } from 'react-hook-form';

import { selectIsAuth, selectAuthStatus } from '../../../redux/slices/auth';
import { createNewWordSet } from '../../../redux/slices/word-sets';
import FormInput from '../../../components/form/FormInput';
import { useState } from 'react';
import { Toast } from '../../../components/messages';
import CircularLoading from '../../../components/wrappers/CircularLoading';

export default function CreateNewWordSetForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  
  if (!isAuth) {
    navigate('/');
  }

  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      newWordSetName: ''
    },
    mode: 'onSubmit'
  });

  const onSubmitForm = async (values) => {
    try {
      const payload = await dispatch(createNewWordSet(values.newWordSetName)).unwrap();
      setToast({ open: true, message: 'Набір успішно створено', severity: 'success' });
      reset();
      navigate(`/word-set/${payload.id}`);
    } catch (error) {
      setToast({ 
        open: true, 
        message: error.message && error.message.length > 0 ? error.message : 'Виникла помилка при створенні набору', 
        severity: 'error' 
      });
    }
  };

  return (
    <>
      <CircularLoading isLoading={authStatus === 'loading'}>
        <h3>Створити новий набір</h3>
        <form onSubmit={handleSubmit(onSubmitForm)} className="mb-3">
          <FormInput
            name="newWordSetName"
            label="Назва набору"
            register={register}
            errors={errors}
            required
            maxLength={30}
            className="word-set-name-input"
            disabled={!isAuth}
          />
          <br />
          <Button className="mt-2" color='primary' variant='contained' disabled={!isAuth} type='submit'>Створити</Button>
        </form>
      </CircularLoading>
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}