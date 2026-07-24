import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogin, selectIsAuth } from '../redux/slices/auth.js';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Paper } from '@mui/material';
import FormInput from '../components/form/FormInput.jsx';
import { useState } from 'react';
import { Toast } from '../components/utils/messages.jsx';

export default function LoginFormPage() {
  const isAuth = useSelector(selectIsAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: ''
    },
    mode: 'onSubmit'
  });

  const onSubmitForm = async (values) => {
    try {
      const data = await dispatch(fetchLogin(values)).unwrap();

      if (!data) {
        throw new Error();
      } else if ('token' in data) {
        window.localStorage.setItem('token', data.token);
      } else {
        throw new Error();
      }
    } catch (error) {
      return setToast({ open: true, message: error?.message?.message || error?.message || t('auth.loginError'), severity: 'error' });
    }
  };

  if (isAuth) {
    navigate('/');
  }

  return (
    <>
      <Box className="container">
        <Paper elevation={3} className='form-block content-block'>
          <h2 className="text-center">{t('auth.loginTitle')}</h2>
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
              autoComplete="current-password"
            />
            <Button color='primary' fullWidth={true} variant='contained' type="submit">{t('auth.loginSubmit')}</Button>
          </form>
        </Paper>
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
