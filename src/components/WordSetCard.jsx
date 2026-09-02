import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Paper, Skeleton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import ProgressBar from './ProgressBar';
import { deleteWordSet, toggleWordSetSave } from '../redux/slices/word-sets';
import { selectIsAuth } from '../redux/slices/auth';
import WordSetName from './wrappers/WordSetName';
import CircularLoading from './wrappers/CircularLoading';
import SaveForLearningButton from './wrappers/SaveForLearningButton';
import { getSetLocalesParts } from './utils/locales';
import { Toast } from './utils/messages';
import { useConfirm } from './utils/useConfirm';

export default function WordSetCard({
  id,
  totalWords,
  learnedWordsCount,
  isSavedForLearning,
  link,
  title,
  sourceLocale,
  translationLocales,
  isLoading,
  showSave = true,
  canDelete = false,
  onDeleted,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const isAuth = useSelector(selectIsAuth);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [isDeleting, setIsDeleting] = useState(false);
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const handleToggleSave = async () => {
    try {
      await dispatch(toggleWordSetSave({ id })).unwrap();
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || t('wordSet.savedToggleError'), severity: 'error' });
    }
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canDelete || isDeleting) return;

    const confirmed = await confirm({
      message: t('wordSet.deleteConfirm'),
      confirmText: t('common.delete'),
      confirmColor: 'error',
    });
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const data = await dispatch(deleteWordSet(id)).unwrap();
      if (!data) {
        setIsDeleting(false);
        setToast({ open: true, message: t('wordSet.deleteError'), severity: 'error' });
        return;
      }
      onDeleted?.(id);
    } catch (error) {
      setIsDeleting(false);
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('wordSet.deleteError'),
        severity: 'error',
      });
    }
  };

  const localesParts = getSetLocalesParts(sourceLocale, translationLocales);
  const numberOfWords = t('wordSet.cardWordsInSet', { count: totalWords });

  const wordSetCardBottomContent = isAuth ? <>
    <Box className="word-set-card__progress">
      <Tooltip title={t('wordSet.learnedCount')}>
        <Box className="word-set-card__progress-bar">
          <ProgressBar total={totalWords || 0} completed={learnedWordsCount || 0} />
        </Box>
      </Tooltip>
    </Box>
    {showSave && (
      <SaveForLearningButton isSavedForLearning={isSavedForLearning} handleToggleSave={handleToggleSave} />
    )}
    {canDelete && (
      <IconButton
        onClick={handleDelete}
        title={t('wordSet.deleteSet')}
        aria-label={t('wordSet.deleteSet')}
        color="error"
        disabled={isDeleting}
      >
        <DeleteIcon className="mui-btn" />
      </IconButton>
    )}
  </> : <>
    <p className='m-0'>{numberOfWords}</p>
  </>;

  return (
    <>
      {isLoading ? <>
        <Skeleton animation="wave" variant="rounded" width={'100%'} height={230} />
      </> : <>
        <Paper elevation={0} className='word-set-card content-block p-3'>
          <CircularLoading isLoading={isLoading}>
            <Box className="word-set-card__top">
              <WordSetName name={title} link={link} />
              {localesParts && (
                <p className="word-set-card__locales">
                  <span>{localesParts.source}</span>
                  {localesParts.targets ? (
                    <>
                      <span className="word-set-card__locales-arrow" aria-hidden="true">→</span>
                      <span>{localesParts.targets}</span>
                    </>
                  ) : null}
                </p>
              )}
            </Box>
            <Box className="word-set-card__bottom">
              {wordSetCardBottomContent}
            </Box>
          </CircularLoading>
        </Paper>
      </>}

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
