import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box, Button, IconButton, TextField, Tooltip, Typography,
} from '@mui/material';

import { syncWordSetWords } from '../redux/slices/word-sets';
import {
  buildBulkPlaceholder,
  diffWordsForSync,
  formatWordSetAsBulkText,
  parseBulkWords,
} from './utils/parseBulkWords';
import { useConfirm } from './utils/useConfirm';
import {
  DEFAULT_TRANSLATION_LOCALES,
  getLocaleLabel,
} from './utils/locales';

export default function WordSetWordsEditor({
  wordSetId,
  words = [],
  translationLocales = DEFAULT_TRANSLATION_LOCALES,
  onNotify,
  onRequestExit,
  exitRequestId = 0,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const confirm = useConfirm();

  const baselineText = useMemo(
    () => formatWordSetAsBulkText(words, translationLocales),
    [words, translationLocales],
  );

  const [text, setText] = useState(baselineText);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setText(baselineText);
  }, [baselineText]);

  useEffect(() => {
    if (!exitRequestId) return undefined;

    let cancelled = false;

    (async () => {
      const dirty = text !== baselineText;
      if (dirty) {
        const confirmed = await confirm({
          message: t('setEditor.dirtyExitConfirm'),
          confirmText: t('setEditor.discard'),
          confirmColor: 'error',
        });
        if (cancelled || !confirmed) return;
      }
      onRequestExit?.();
    })();

    return () => {
      cancelled = true;
    };
  }, [exitRequestId]); // eslint-disable-line react-hooks/exhaustive-deps -- only react to exit requests

  const importHint = useMemo(() => {
    const parts = [t('bulkImport.colWord'), t('bulkImport.colSentence')];
    translationLocales.forEach((locale) => {
      const label = getLocaleLabel(locale).toLowerCase();
      parts.push(
        t('bulkImport.colTranslation', { label }),
        t('bulkImport.colSentenceTranslation', { label }),
      );
    });
    return t('setEditor.columnsHint', { columns: parts.join(' | ') });
  }, [translationLocales, t]);

  const placeholder = useMemo(
    () => buildBulkPlaceholder(translationLocales),
    [translationLocales],
  );

  const { words: parsedWords, errors } = useMemo(
    () => parseBulkWords(text, translationLocales),
    [text, translationLocales],
  );

  const diff = useMemo(
    () => diffWordsForSync(words, parsedWords, translationLocales),
    [words, parsedWords, translationLocales],
  );

  const isDirty = text !== baselineText;
  const canSave = isDirty && errors.length === 0 && !diff.hasDuplicates;

  const onReset = () => {
    setText(baselineText);
  };

  const onSave = async () => {
    if (!canSave || !wordSetId) return;

    if (diff.removed > 0) {
      const confirmed = await confirm({
        message: t('setEditor.confirmDelete', {
          removed: diff.removed,
          added: diff.added,
          updated: diff.updated,
        }),
        confirmText: t('setEditor.save'),
        confirmColor: 'error',
      });
      if (!confirmed) return;
    }

    setIsSaving(true);
    try {
      const result = await dispatch(syncWordSetWords({
        wordSetId,
        words: parsedWords,
      })).unwrap();

      onNotify?.({
        message: t('setEditor.saved', {
          added: result.added ?? diff.added,
          updated: result.updated ?? diff.updated,
          removed: result.removed ?? diff.removed,
        }),
        severity: 'success',
      });
    } catch (error) {
      onNotify?.({
        message: error?.message?.message || error?.message || t('setEditor.saveError'),
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box className="word-set-text-editor content-block">
      <Box className="word-set-text-editor__header">
        <Typography variant="h6" component="h3" className="word-set-text-editor__title">
          {t('setEditor.title')}
        </Typography>
        <Tooltip title={importHint} arrow placement="top">
          <IconButton size="small" className="word-set-text-editor__info-btn" aria-label={t('setEditor.formatHintAria')}>
            <InfoOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography className="word-set-text-editor__hint">
        {t('setEditor.intro')}
      </Typography>

      <TextField
        multiline
        minRows={12}
        maxRows={28}
        fullWidth
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="word-set-text-editor__textarea"
        autoComplete="off"
      />

      {errors.length > 0 && (
        <Box className="word-set-text-editor__errors">
          {errors.slice(0, 5).map((error) => (
            <Typography key={error} component="p">{error}</Typography>
          ))}
          {errors.length > 5 && (
            <Typography component="p">{t('bulkImport.moreErrors', { count: errors.length - 5 })}</Typography>
          )}
        </Box>
      )}

      {errors.length === 0 && isDirty && (
        <Typography className="word-set-text-editor__summary">
          {t('setEditor.summary', {
            added: diff.added,
            updated: diff.updated,
            removed: diff.removed,
          })}
        </Typography>
      )}

      <Box className="word-set-text-editor__actions">
        <Button
          variant="outlined"
          color="inherit"
          onClick={onReset}
          disabled={!isDirty || isSaving}
        >
          {t('setEditor.reset')}
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!canSave || isSaving}
        >
          {isSaving ? t('setEditor.saving') : t('setEditor.save')}
        </Button>
      </Box>
    </Box>
  );
}
