import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Paper, TextField } from '@mui/material';

import { fetchRegister, selectIsAuth } from '../redux/slices/auth.js';
import FormInput from '../components/form/FormInput.jsx';
import { useEffect, useState } from 'react';
import { Toast } from '../components/utils/messages.jsx';

export default function SignupFormPage() {
  const isAuth = useSelector(selectIsAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      const { username, password, confirm_password: confirmPassword } = values;
    if (password !== confirmPassword) {
      return setToast({ open: true, message: t('auth.passwordMismatch'), severity: 'error' });
    }

    try {
      const data = await dispatch(fetchRegister({ username, password })).unwrap();

      if (!data) {
        throw new Error();
      } else if ('token' in data) {
        window.localStorage.setItem('token', data.token);
      } else {
        throw new Error();
      }
    } catch (error) {      
      return setToast({ open: true, message: error?.message?.message || error?.message || t('auth.registerError'), severity: 'error' });
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
          <h2 className="text-center">{t('auth.registerTitle')}</h2>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <FormInput
              name="username"
              label={t('auth.username')}
              register={register}
              errors={errors}
              required fullWidth
              maxLength={20}
              autoComplete="username"
            />
            <FormInput
              name="password"
              type='password'
              label={t('auth.password')}
              register={register}
              errors={errors}
              required fullWidth
              maxLength={20}
              autoComplete="new-password"
            />

            <FormInput
              name="confirm_password"
              type="password"
              label={t('auth.confirmPassword')}
              register={register}
              errors={errors}
              required fullWidth
              maxLength={20}
              autoComplete="new-password" />
            <Button color='primary' fullWidth variant='contained' type="submit">{t('auth.registerSubmit')}</Button>
          </form>
        </Paper>
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
