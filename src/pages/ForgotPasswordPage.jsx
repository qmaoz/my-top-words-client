import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Paper } from '@mui/material';

import axios from '../axios';
import FormInput from '../components/form/FormInput';
import { Toast } from '../components/utils/messages';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });

  const onSubmitForm = async (values) => {
    try {
      setIsSubmitting(true);
      await axios.post('/auth/forgot-password', { email: values.email.trim() });
      setToast({ open: true, message: t('auth.forgotPasswordSent'), severity: 'success' });
    } catch (error) {
      setToast({
        open: true,
        message: error?.response?.data?.message || error?.message || t('common.genericError'),
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
          <h2>{t('auth.forgotPasswordTitle')}</h2>
          <p className="form-block__hint">{t('auth.forgotPasswordHint')}</p>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <FormInput
              name="email"
              type="email"
              label={t('auth.email')}
              register={register}
              errors={errors}
              required
              fullWidth
              autoComplete="email"
            />
            <Button color="primary" fullWidth variant="contained" type="submit" disabled={isSubmitting}>
              {t('auth.forgotPasswordSubmit')}
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
