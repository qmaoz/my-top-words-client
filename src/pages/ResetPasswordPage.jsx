import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, Button, Paper } from '@mui/material';

import axios from '../axios';
import FormInput from '../components/form/FormInput';
import { Toast } from '../components/utils/messages';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { password: '', confirm_password: '' },
    mode: 'onSubmit',
  });

  const onSubmitForm = async (values) => {
    if (values.password !== values.confirm_password) {
      return setToast({ open: true, message: t('auth.passwordMismatch'), severity: 'error' });
    }
    if (!token) {
      return setToast({ open: true, message: t('errors.resetInvalidToken'), severity: 'error' });
    }

    try {
      setIsSubmitting(true);
      await axios.post('/auth/reset-password', {
        token,
        password: values.password,
        confirm_password: values.confirm_password,
      });
      setToast({ open: true, message: t('auth.resetPasswordSuccess'), severity: 'success' });
      window.setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setToast({
        open: true,
        message: error?.response?.data?.message || error?.message || t('errors.resetInvalidToken'),
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box className="container">
        <Paper elevation={0} className="form-block content-block">
          <h2>{t('auth.resetPasswordTitle')}</h2>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <FormInput
              name="password"
              type="password"
              label={t('auth.password')}
              register={register}
              errors={errors}
              required
              fullWidth
              maxLength={20}
              autoComplete="new-password"
            />
            <FormInput
              name="confirm_password"
              type="password"
              label={t('auth.confirmPassword')}
              register={register}
              errors={errors}
              required
              fullWidth
              maxLength={20}
              autoComplete="new-password"
            />
            <Button color="primary" fullWidth variant="contained" type="submit" disabled={isSubmitting}>
              {t('auth.resetPasswordSubmit')}
            </Button>
          </form>
          <p className="form-block__extra">
            <Link to="/login">{t('auth.backToLogin')}</Link>
          </p>
        </Paper>
      </Box>
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
