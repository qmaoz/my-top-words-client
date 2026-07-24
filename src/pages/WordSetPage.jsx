import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import WordSearchBlock from '../components/WordSearchBlock';
import CopyWordSetContentButton from '../components/CopyWordSetContentButton';
import WordSetVisibilityMenu from '../components/WordSetVisibilityMenu';
import WordSetRemarksPanel from '../components/WordSetRemarksPanel';
import { selectIsAuth, selectUserData } from '../redux/slices/auth';
import { deleteWordSet, fetchWordSet, toggleWordSetSave, updateWordSet } from '../redux/slices/word-sets';
import { ErrorMessage, Toast, getWordSetLoadError } from '../components/utils/messages';
import FormInput from '../components/form/FormInput';
import WordSetName from '../components/wrappers/WordSetName';
import CircularLoading from '../components/wrappers/CircularLoading';
import SaveForLearningButton from '../components/wrappers/SaveForLearningButton';
import ProgressBar from '../components/ProgressBar';
import { Box, Typography } from '@mui/material';
import LanguageSettings from '../components/LanguageSettings';
import WordSetWordsEditor from '../components/WordSetWordsEditor';
import { useConfirm } from '../components/utils/useConfirm';
import { useDocumentTitle } from '../components/utils/useDocumentTitle';
import { isThunkSkipped } from '../components/utils/functions';
import { getWordSetVisibilityOptions } from '../components/utils/wordSetVisibility';
import {
  DEFAULT_SOURCE_LOCALE,
  DEFAULT_TRANSLATION_LOCALES,
  getLocaleLabel,
} from '../components/utils/locales';

export default function WordSetPage() {
  const { t } = useTranslation();
  const { id: wordSetId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const isAuth = useSelector(selectIsAuth);
  const userData = useSelector(selectUserData);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const { activeItem, activeItemStatus } = useSelector((state) => state.wordSets);
  const isWordSetLoaded = activeItemStatus === 'loaded' && Number(activeItem?.id) === Number(wordSetId);
  useDocumentTitle(isWordSetLoaded ? activeItem?.name : undefined);
  const isOwnWordSet = activeItem && userData && activeItem?.owner_user_id == userData?.id;
  const totalWords = activeItem?.words?.length || 0;
  const sourceLocale = activeItem?.source_locale ?? DEFAULT_SOURCE_LOCALE;
  const translationLocales = activeItem?.translation_locales ?? DEFAULT_TRANSLATION_LOCALES;
  const learnedWordsCount = activeItem?.learnedWordsCount
    ?? activeItem?.words?.filter((word) => word.isLearned).length
    ?? 0;

  const isSavedForLearning = activeItem?.isSavedForLearning || false;

  const navigateBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleToggleSave = async () => {
    try {
      const data = await dispatch(toggleWordSetSave({ id: wordSetId })).unwrap();

      if (!data) {
        setToast({ open: true, message: t('wordSet.savedToggleError'), severity: 'error' });
      }
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || t('wordSet.savedToggleError'), severity: 'error' });
    }
  };

  const handleVisibilityChange = async (nextVisibility) => {
    if (!isOwnWordSet) return;

    const visibilityOptions = getWordSetVisibilityOptions();
    const confirmed = await confirm(visibilityOptions[nextVisibility]?.confirm);
    if (!confirmed) return;

    try {
      const data = await dispatch(updateWordSet({ id: wordSetId, visibility: nextVisibility })).unwrap();
      if (!data) {
        setToast({ open: true, message: t('wordSet.visibilityChangeError'), severity: 'error' });
      }
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('wordSet.visibilityChangeError'),
        severity: 'error',
      });
    }
  };

  const handleDeleteWordSet = async () => {
    if (!isOwnWordSet) return;

    const confirmed = await confirm({
      message: t('wordSet.deleteConfirm'),
      confirmText: t('common.delete'),
      confirmColor: 'error',
    });

    if (!confirmed) return;

    try {
      const data = await dispatch(deleteWordSet(wordSetId)).unwrap();
      if (!data) {
        return setToast({ open: true, message: t('wordSet.deleteError'), severity: 'error' });
      }
      navigateBack();
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || t('wordSet.deleteError'), severity: 'error' });
    }
  };

  const [isEditingWords, setIsEditingWords] = useState(false);
  const [editorExitRequestId, setEditorExitRequestId] = useState(0);
  const [isNameEditing, setIsNameEditing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      word_set_name: activeItem?.name ?? '',
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (activeItem?.name != null && !isNameEditing) {
      reset({ word_set_name: activeItem.name });
    }
  }, [activeItem?.id, activeItem?.name, reset, isNameEditing]);

  const onSaveName = async (values) => {
    if (!isOwnWordSet) return;

    const trimmedName = values.word_set_name.trim();
    if (trimmedName !== activeItem.name) {
      try {
        const data = await dispatch(updateWordSet({ id: wordSetId, name: trimmedName })).unwrap();
        if (!data) {
          return setToast({ open: true, message: t('wordSet.nameUpdateError'), severity: 'error' });
        }
        setToast({ open: true, message: t('wordSet.nameSaved'), severity: 'success' });
      } catch (error) {
        return setToast({ open: true, message: error?.message?.message || error?.message || t('wordSet.nameUpdateError'), severity: 'error' });
      }
    }

    setIsNameEditing(false);
  };

  const onCancelName = () => {
    reset({ word_set_name: activeItem?.name ?? '' });
    setIsNameEditing(false);
  };

  const toggleWordsEditing = () => {
    if (!isOwnWordSet) return;

    if (isEditingWords) {
      setEditorExitRequestId((value) => value + 1);
      return;
    }

    setEditorExitRequestId(0);
    setIsEditingWords(true);
  };

  const handleSourceLocaleChange = async (nextSource) => {
    if (!isOwnWordSet || nextSource === sourceLocale) return;

    try {
      await dispatch(updateWordSet({ id: wordSetId, source_locale: nextSource })).unwrap();
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('wordSet.sourceLocaleChangeError'),
        severity: 'error',
      });
    }
  };

  const handleTranslationLocalesChange = async (nextLocales) => {
    if (!isOwnWordSet) return;

    const removed = translationLocales.filter((locale) => !nextLocales.includes(locale));

    if (removed.length > 0 && totalWords > 0) {
      const removedLabels = removed.map(getLocaleLabel).join(', ');
      const confirmed = await confirm({
        message: t('wordSet.removeLocaleConfirm', { locales: removedLabels }),
        confirmText: t('wordSet.removeLocaleButton'),
        confirmColor: 'error',
      });
      if (!confirmed) return;
    }

    try {
      await dispatch(updateWordSet({ id: wordSetId, translation_locales: nextLocales })).unwrap();
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('wordSet.translationLocalesChangeError'),
        severity: 'error',
      });
    }
  };

  const prevAuthRef = useRef(isAuth);

  useEffect(() => {
    setIsEditingWords(false);
    setIsNameEditing(false);
  }, [wordSetId]);

  useEffect(() => {
    const authChanged = prevAuthRef.current !== isAuth;
    prevAuthRef.current = isAuth;

    dispatch(fetchWordSet(
      authChanged ? { id: wordSetId, force: true } : wordSetId,
    )).unwrap().catch((error) => {
      if (isThunkSkipped(error)) return;

      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('common.setLoadError'),
        severity: 'error',
      });
    });
  }, [dispatch, wordSetId, isAuth, t]);

  const isCurrentSetLoaded = activeItem
    && Number(activeItem.id) === Number(wordSetId)
    && activeItemStatus === 'loaded';

  const isPageLoading = activeItemStatus === 'loading'
    || Boolean(activeItem && Number(activeItem.id) !== Number(wordSetId));

  return (
    <>
      <Box className="word-set-page container">
        <CircularLoading isLoading={isPageLoading}>
          {activeItemStatus === 'error' ? (
            <ErrorMessage message={getWordSetLoadError()} />
          ) : isCurrentSetLoaded ? (
            <>
              <Box className="word-set-page-header df gap-3">
                <Box className="word-set-page-header__title">
                  {!isNameEditing ? (
                    <>
                      <WordSetName name={activeItem?.name} maxLength={24} />
                      {isOwnWordSet && (
                        <IconButton
                          onClick={() => setIsNameEditing(true)}
                          title={t('wordSet.editName')}
                          aria-label={t('wordSet.editName')}
                          color="primary"
                        >
                          <EditIcon className="mui-btn" />
                        </IconButton>
                      )}
                    </>
                  ) : (
                    <form className="word-set-name-edit-form" onSubmit={handleSubmit(onSaveName)}>
                      <FormInput
                        name="word_set_name"
                        label={t('profile.createSetName')}
                        register={register}
                        errors={errors}
                        required
                        maxLength={30}
                        className="word-set-name-input"
                        autoComplete="off"
                      />
                      <IconButton type="submit" title={t('wordSet.saveName')} aria-label={t('wordSet.saveName')} color="success">
                        <SaveIcon className="mui-btn" />
                      </IconButton>
                      <IconButton type="button" onClick={onCancelName} title={t('common.cancel')} aria-label={t('common.cancel')} color="error">
                        <CloseIcon className="mui-btn" />
                      </IconButton>
                    </form>
                  )}
                </Box>

                <Box className="word-set-page-header__right">
                  {activeItem && isAuth &&
                    <SaveForLearningButton isSavedForLearning={isSavedForLearning} handleToggleSave={handleToggleSave} />
                  }
                  {totalWords > 0 &&
                    <CopyWordSetContentButton
                      words={activeItem.words}
                      translationLocales={translationLocales}
                      onNotify={({ message, severity }) => setToast({ open: true, message, severity })}
                    />
                  }
                  {activeItem && isAuth && isOwnWordSet &&
                    <>
                      <IconButton
                        onClick={toggleWordsEditing}
                        title={isEditingWords ? t('common.done') : t('wordSet.editWords')}
                        aria-label={isEditingWords ? t('wordSet.finishEditingWords') : t('wordSet.editWords')}
                        color={isEditingWords ? 'success' : 'primary'}
                      >
                        {isEditingWords ? <CheckIcon className="mui-btn" /> : <EditNoteIcon className="mui-btn" />}
                      </IconButton>
                      <WordSetVisibilityMenu
                        visibility={activeItem?.visibility ?? (activeItem?.is_public ? 'public' : 'private')}
                        onChange={handleVisibilityChange}
                      />
                      <IconButton onClick={handleDeleteWordSet} title={t('wordSet.deleteSet')} aria-label={t('wordSet.deleteSet')} color="error">
                        <DeleteIcon className="mui-btn" />
                      </IconButton>
                    </>
                  }
                </Box>
              </Box>

              {isOwnWordSet && !isEditingWords && (
                <WordSetRemarksPanel wordSetId={wordSetId} />
              )}

              {isAuth && !isEditingWords && totalWords > 0 && (
                <Box className="word-set-progress-row df gap-3">
                  <span className="text-nowrap">{t('wordSet.learnedCount')}</span>
                  <ProgressBar total={totalWords} completed={learnedWordsCount} />
                </Box>
              )}
              {!isEditingWords && totalWords > 0 && (
                <Box className="rounded">
                  <Link to={`/translate-exercise/${wordSetId}`} className="exercise-card rounded">
                    <svg className="exercise-logo" alt="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor"><path d="M192 64C209.7 64 224 78.3 224 96L224 128L352 128C369.7 128 384 142.3 384 160C384 177.7 369.7 192 352 192L342.4 192L334 215.1C317.6 260.3 292.9 301.6 261.8 337.1C276 345.9 290.8 353.7 306.2 360.6L356.6 383L418.8 243C423.9 231.4 435.4 224 448 224C460.6 224 472.1 231.4 477.2 243L605.2 531C612.4 547.2 605.1 566.1 589 573.2C572.9 580.3 553.9 573.1 546.8 557L526.8 512L369.3 512L349.3 557C342.1 573.2 323.2 580.4 307.1 573.2C291 566 283.7 547.1 290.9 531L330.7 441.5L280.3 419.1C257.3 408.9 235.3 396.7 214.5 382.7C193.2 399.9 169.9 414.9 145 427.4L110.3 444.6C94.5 452.5 75.3 446.1 67.4 430.3C59.5 414.5 65.9 395.3 81.7 387.4L116.2 370.1C132.5 361.9 148 352.4 162.6 341.8C148.8 329.1 135.8 315.4 123.7 300.9L113.6 288.7C102.3 275.1 104.1 254.9 117.7 243.6C131.3 232.3 151.5 234.1 162.8 247.7L173 259.9C184.5 273.8 197.1 286.7 210.4 298.6C237.9 268.2 259.6 232.5 273.9 193.2L274.4 192L64.1 192C46.3 192 32 177.7 32 160C32 142.3 46.3 128 64 128L160 128L160 96C160 78.3 174.3 64 192 64zM448 334.8L397.7 448L498.3 448L448 334.8z" /></svg>
                    <Box>
                      <Typography variant="h5" component="h3">{t('wordSet.practice')}</Typography>
                      <Typography className="exercise-card__subtitle">{t('wordSet.practiceHint')}</Typography>
                    </Box>
                  </Link>
                </Box>
              )}

              {isEditingWords && (
                <Box className="word-set-languages content-block">
                  <Typography variant="h6" component="h3" className="word-set-languages__title">
                    {t('wordSet.setLanguages')}
                  </Typography>
                  <LanguageSettings
                    sourceLocale={sourceLocale}
                    translationLocales={translationLocales}
                    onSourceChange={handleSourceLocaleChange}
                    onTranslationChange={handleTranslationLocalesChange}
                    disableSourceChange={totalWords > 0}
                  />
                </Box>
              )}
              {isEditingWords ? (
                <WordSetWordsEditor
                  wordSetId={wordSetId}
                  words={activeItem?.words}
                  translationLocales={translationLocales}
                  exitRequestId={editorExitRequestId}
                  onRequestExit={() => {
                    setIsEditingWords(false);
                    setEditorExitRequestId(0);
                  }}
                  onNotify={({ message, severity }) => setToast({ open: true, message, severity })}
                />
              ) : (
                <WordSearchBlock
                  words={activeItem?.words}
                  isEditing={false}
                  sourceLocale={sourceLocale}
                  translationLocales={translationLocales}
                />
              )}
            </>
          ) : null}
        </CircularLoading>
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
