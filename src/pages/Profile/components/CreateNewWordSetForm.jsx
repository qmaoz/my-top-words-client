import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { selectIsAuth, selectAuthStatus } from '../../../redux/slices/auth';
import { createNewWordSet } from '../../../redux/slices/word-sets';
import FormInput from '../../../components/form/FormInput';
import { Toast } from '../../../components/utils/messages';
import CircularLoading from '../../../components/wrappers/CircularLoading';
import LanguageSettings from '../../../components/LanguageSettings';
import { DEFAULT_SOURCE_LOCALE, DEFAULT_TRANSLATION_LOCALES } from '../../../components/utils/locales';

export default function CreateNewWordSetForm({ className }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  const rootClassName = ['create-word-set-form', className].filter(Boolean).join(' ');
  
  useEffect(() => {
    if (!isAuth && authStatus !== 'loading') {
      navigate('/');
    }
  }, [isAuth, authStatus, navigate]);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const [sourceLocale, setSourceLocale] = useState(DEFAULT_SOURCE_LOCALE);
  const [translationLocales, setTranslationLocales] = useState([...DEFAULT_TRANSLATION_LOCALES]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      newWordSetName: ''
    },
    mode: 'onSubmit'
  });

  const handleSourceChange = (nextSource) => {
    setSourceLocale(nextSource);
    setTranslationLocales((prev) => {
      const next = prev.filter((locale) => locale !== nextSource);
      return next.length > 0 ? next : ['uk'];
    });
  };

  const onSubmitForm = async (values) => {
    try {
      const payload = await dispatch(createNewWordSet({
        name: values.newWordSetName,
        source_locale: sourceLocale,
        translation_locales: translationLocales,
      })).unwrap();
      setToast({ open: true, message: t('profile.createSetSuccess'), severity: 'success' });
      reset();
      setSourceLocale(DEFAULT_SOURCE_LOCALE);
      setTranslationLocales([...DEFAULT_TRANSLATION_LOCALES]);
      navigate(`/word-set/${payload.id}`);
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || t('profile.createSetError'), severity: 'error' });
    }
  };

  return (
    <>
      <Box className={rootClassName}>
        <CircularLoading isLoading={authStatus === 'loading'}>
          <h3>{t('profile.createSetTitle')}</h3>
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
              sourceLocale={sourceLocale}
              translationLocales={translationLocales}
              onSourceChange={handleSourceChange}
              onTranslationChange={setTranslationLocales}
              disabled={!isAuth}
            />
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!isAuth}
              className="create-word-set-form__submit"
            >
              {t('profile.createSetSubmit')}
            </Button>
          </form>
        </CircularLoading>
      </Box>
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}