import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, Button, MenuItem, Paper, Select, Typography } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import axios from '../../axios';
import {
  logout,
  selectPreferredTranslationLocale,
  selectUserData,
  updateUserEmail,
  updateUserPreferences,
} from '../../redux/slices/auth';
import { SUPPORTED_LOCALES, getLocaleDisplay } from '../../components/utils/locales';
import FormInput from '../../components/form/FormInput';
import { Toast } from '../../components/utils/messages';
import { useConfirm } from '../../components/utils/useConfirm';
import InfoHint from '../../components/InfoHint';

export default function ProfileSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { t } = useTranslation();
  const preferredLocale = useSelector(selectPreferredTranslationLocale) ?? 'en';
  const userData = useSelector(selectUserData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      email: userData?.email || '',
      current_password: '',
    },
  });

  useEffect(() => {
    reset({
      email: userData?.email || '',
      current_password: '',
    });
  }, [userData?.email, reset]);

  const handleTranslationChange = async (event) => {
    const locale = event.target.value;
    if (locale === preferredLocale) return;

    try {
      setIsSaving(true);
      await dispatch(updateUserPreferences({ preferred_translation_locale: locale })).unwrap();
      setToast({ open: true, message: t('profile.settingsSaved'), severity: 'success' });
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('profile.settingsSaveError'),
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailSubmit = async (values) => {
    try {
      setIsSavingEmail(true);
      await dispatch(updateUserEmail({
        email: values.email.trim(),
        current_password: values.current_password,
      })).unwrap();
      reset({ email: values.email.trim(), current_password: '' });
      setToast({ open: true, message: t('profile.emailSaved'), severity: 'success' });
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('profile.emailSaveError'),
        severity: 'error',
      });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await confirm({
      title: t('profile.deleteConfirmTitle'),
      message: t('profile.deleteConfirmText'),
      confirmText: t('profile.deleteConfirmYes'),
      cancelText: t('common.cancel'),
      confirmColor: 'error',
    });

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await axios.delete('/user');
      dispatch(logout());
      navigate('/');
    } catch (error) {
      setToast({
        open: true,
        message: error?.response?.data?.message || t('profile.deleteError'),
        severity: 'error',
      });
      setIsDeleting(false);
    }
  };

  return (
    <Box className="profile-settings">
      <Paper elevation={0} className="content-block profile-settings-card">
        <Box className="heading-with-info">
          <Typography variant="h6" component="h3" className="profile-settings-card__title">
            {t('profile.translationTitle')}
          </Typography>
          <InfoHint title={t('profile.translationHint')} />
        </Box>
        <Select
          size="small"
          value={preferredLocale}
          onChange={handleTranslationChange}
          disabled={isSaving}
          fullWidth
          className="profile-settings-card__control"
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <MenuItem key={locale.code} value={locale.code}>
              {getLocaleDisplay(locale.code)}
            </MenuItem>
          ))}
        </Select>
      </Paper>

      <Paper elevation={0} className="content-block profile-settings-card">
        <Box className="heading-with-info">
          <Typography variant="h6" component="h3" className="profile-settings-card__title">
            {t('profile.emailTitle')}
          </Typography>
          <InfoHint title={t('profile.emailHint')} />
        </Box>
        <form onSubmit={handleSubmit(handleEmailSubmit)}>
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
          <FormInput
            name="current_password"
            type="password"
            label={t('profile.currentPassword')}
            register={register}
            errors={errors}
            required
            fullWidth
            maxLength={20}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isSavingEmail}
            className="profile-settings-card__control"
          >
            {t('profile.emailSave')}
          </Button>
        </form>
      </Paper>

      <Paper elevation={0} className="content-block profile-settings-card profile-settings-card--danger">
        <Box className="heading-with-info">
          <Typography variant="h6" component="h3" className="profile-settings-card__title">
            {t('profile.deleteTitle')}
          </Typography>
          <InfoHint title={t('profile.deleteHint')} />
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="profile-settings-card__control"
        >
          {t('profile.deleteButton')}
        </Button>
      </Paper>

      <Toast {...toast} handleClose={handleCloseToast} />
    </Box>
  );
}
