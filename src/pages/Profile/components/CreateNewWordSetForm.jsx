import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { useForm } from 'react-hook-form';

import { selectIsAuth, selectAuthStatus } from '../../../redux/slices/auth';
import { createNewWordSet } from '../../../redux/slices/word-sets';
import FormInput from '../../../components/form/FormInput';
import { Toast } from '../../../components/utils/messages';
import CircularLoading from '../../../components/wrappers/CircularLoading';

export default function CreateNewWordSetForm({ className }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  
  useEffect(() => {
    if (!isAuth && authStatus !== 'loading') {
      navigate('/');
    }
  }, [isAuth, authStatus, navigate]);

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
      setToast({ open: true, message: error?.message?.message || error?.message || 'Не вдалося створити набір', severity: 'error' });
    }
  };

  return (
    <>
      <Box className={className ? className : undefined}>
        <CircularLoading isLoading={authStatus === 'loading'}>
          <h3>Створити новий набір</h3>
          <form onSubmit={handleSubmit(onSubmitForm)} className="inline-form-row mb-3 df ais gap-3">
            <FormInput
              name="newWordSetName"
              label="Назва набору"
              register={register}
              errors={errors}
              required fullWidth
              maxLength={30}
              className="word-set-name-input m-0"
              disabled={!isAuth}
            />
            <Button type='submit' color='primary' variant='contained' disabled={!isAuth} className='ps-3 pe-3'>Створити</Button>
          </form>
        </CircularLoading>
      </Box>
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}