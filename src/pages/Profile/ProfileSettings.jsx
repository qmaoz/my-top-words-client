import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, MenuItem, Paper, Select, Typography } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import axios from '../../axios';
import {
  logout,
  selectPreferredTranslationLocale,
  selectUiLocale,
  updateUserPreferences,
} from '../../redux/slices/auth';
import { SUPPORTED_LOCALES, getLocaleDisplay } from '../../components/utils/locales';
import { Toast } from '../../components/utils/messages';
import { useConfirm } from '../../components/utils/useConfirm';

function LocaleSettingCard({ title, hint, value, disabled, onChange }) {
  return (
    <Paper elevation={0} className="content-block profile-settings-card">
      <Typography variant="h6" component="h3" className="profile-settings-card__title">
        {title}
      </Typography>
      <Typography className="profile-settings-card__hint">
        {hint}
      </Typography>
      <Select
        size="small"
        value={value}
        onChange={onChange}
        disabled={disabled}
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
  );
}

export default function ProfileSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { t } = useTranslation();
  const preferredLocale = useSelector(selectPreferredTranslationLocale) ?? 'en';
  const uiLocale = useSelector(selectUiLocale) ?? 'en';
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));

  const savePreferences = async (preferences) => {
    try {
      setIsSaving(true);
      await dispatch(updateUserPreferences(preferences)).unwrap();
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

  const handleTranslationChange = (event) => {
    const locale = event.target.value;
    if (locale !== preferredLocale) {
      savePreferences({ preferred_translation_locale: locale });
    }
  };

  const handleUiChange = (event) => {
    const locale = event.target.value;
    if (locale !== uiLocale) {
      savePreferences({ ui_locale: locale });
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
      <LocaleSettingCard
        title={t('profile.translationTitle')}
        hint={t('profile.translationHint')}
        value={preferredLocale}
        disabled={isSaving}
        onChange={handleTranslationChange}
      />

      <LocaleSettingCard
        title={t('profile.uiTitle')}
        hint={t('profile.uiHint')}
        value={uiLocale}
        disabled={isSaving}
        onChange={handleUiChange}
      />

      <Paper elevation={0} className="content-block profile-settings-card profile-settings-card--danger">
        <Typography variant="h6" component="h3" className="profile-settings-card__title">
          {t('profile.deleteTitle')}
        </Typography>
        <Typography className="profile-settings-card__hint">
          {t('profile.deleteHint')}
        </Typography>
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
