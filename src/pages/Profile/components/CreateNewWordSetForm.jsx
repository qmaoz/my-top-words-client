import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { selectIsAuth, selectAuthStatus, selectPreferredTranslationLocale } from '../../../redux/slices/auth';
import { createNewWordSet } from '../../../redux/slices/word-sets';
import FormInput from '../../../components/form/FormInput';
import { Toast } from '../../../components/utils/messages';
import CircularLoading from '../../../components/wrappers/CircularLoading';
import LanguageSettings from '../../../components/LanguageSettings';
import {
  buildDefaultSetLocales,
  splitSetLocales,
} from '../../../components/utils/locales';

export default function CreateNewWordSetForm({ className }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  const preferredTranslationLocale = useSelector(selectPreferredTranslationLocale);
  const defaultSetLocales = useMemo(
    () => buildDefaultSetLocales(preferredTranslationLocale),
    [preferredTranslationLocale],
  );
  const rootClassName = ['create-word-set-form', 'content-block', className].filter(Boolean).join(' ');

  useEffect(() => {
    if (!isAuth && authStatus !== 'loading') {
      navigate('/');
    }
  }, [isAuth, authStatus, navigate]);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const [isOpen, setIsOpen] = useState(false);

  const [setLocales, setSetLocales] = useState(() => buildDefaultSetLocales(preferredTranslationLocale));

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      newWordSetName: '',
    },
    mode: 'onSubmit',
  });

  const onSubmitForm = async (values) => {
    const { sourceLocale, translationLocales } = splitSetLocales(setLocales);

    try {
      const payload = await dispatch(createNewWordSet({
        name: values.newWordSetName,
        source_locale: sourceLocale,
        translation_locales: translationLocales,
      })).unwrap();
      setToast({ open: true, message: t('profile.createSetSuccess'), severity: 'success' });
      reset();
      setSetLocales([...defaultSetLocales]);
      setIsOpen(false);
      navigate(`/word-set/${payload.id}`);
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('profile.createSetError'),
        severity: 'error',
      });
    }
  };

  return (
    <>
      {!isOpen ? (
        <Button
          type="button"
          color="primary"
          variant="contained"
          onClick={() => {
            setSetLocales([...defaultSetLocales]);
            setIsOpen(true);
          }}
          disabled={!isAuth}
          className="create-word-set-form__open"
        >
          {t('profile.createSetTitle')}
        </Button>
      ) : (
      <Box className={rootClassName} component="section">
        <CircularLoading isLoading={authStatus === 'loading'}>
          <h3 className="create-word-set-form__title">{t('profile.createSetTitle')}</h3>
          <form onSubmit={handleSubmit(onSubmitForm)} className="create-word-set-form__fields">
            <FormInput
              name="newWordSetName"
              label={t('profile.createSetName')}
              register={register}
              errors={errors}
              required
              fullWidth
              maxLength={30}
              className="word-set-name-input m-0"
              disabled={!isAuth}
              autoComplete="off"
            />
            <LanguageSettings
              locales={setLocales}
              onChange={setSetLocales}
              disabled={!isAuth}
            />
            <Box className="create-word-set-form__actions">
              <Button
                type="button"
                color="inherit"
                variant="text"
                onClick={() => {
                  setIsOpen(false);
                  reset();
                  setSetLocales([...defaultSetLocales]);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={!isAuth}
                className="create-word-set-form__submit"
              >
                {t('profile.createSetSubmit')}
              </Button>
            </Box>
          </form>
        </CircularLoading>
      </Box>
      )}
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
