import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, TextField } from '@mui/material';

import { fetchRegister, selectIsAuth } from '../redux/slices/auth.js';
import FormInput from '../components/form/FormInput.jsx';
import { useEffect, useState } from 'react';
import { Toast } from '../components/utils/messages.jsx';

export default function SignupFormPage() {
  const isAuth = useSelector(selectIsAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: '',
      confirm_password: '',
    },
    mode: 'onSubmit'
  });

  const onSubmitForm = async (values) => {
    if (values?.password && values?.confirm_password && values.password !== values.confirm_password) {
      return setToast({ open: true, message: 'Паролі не співпадають', severity: 'error' });
    }
    
    try {
      const data = await dispatch(fetchRegister(values)).unwrap();

      if (!data) {
        throw new Error();
      } else if ('token' in data) {
        window.localStorage.setItem('token', data.token);
      } else {
        throw new Error();
      }
    } catch (error) {      
      return setToast({ open: true, message: error?.message?.message || error?.message || 'Невідома помилка при реєстрації', severity: 'error' });
    }
  };

  useEffect(() => {
    if (isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate]);


  return (
    <>
      <Box className="container">
        <Paper elevation={3} className='form-block content-block'>
          <h2 className="text-center mb-3">Форма реєстрації</h2>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <FormInput
              name="username"
              label="Ім’я користувача"
              register={register}
              errors={errors}
              required fullWidth
              maxLength={20}
              autoComplete="username"
            />
            <FormInput
              name="password"
              type='password'
              label="Пароль"
              register={register}
              errors={errors}
              required fullWidth
              maxLength={20}
              className="mt-3"
              autoComplete="new-password"
            />

            <FormInput
              name="confirm_password"
              type="password"
              label="Підтвердження пароля"
              register={register}
              errors={errors}
              required fullWidth
              maxLength={20}
              className="mt-3"
              autoComplete="new-password" />
            <Button color='primary' fullWidth variant='contained' className="mt-3" type="submit">Зареєструватися</Button>
          </form>
        </Paper>
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
