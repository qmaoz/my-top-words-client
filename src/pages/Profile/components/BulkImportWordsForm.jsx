import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box, Button, IconButton, TextField, Tooltip, Typography,
} from '@mui/material';

import { bulkImportWords, clearWordSetWords } from '../../../redux/slices/word-sets';
import { BULK_WORDS_PLACEHOLDER, parseBulkWords, partitionBulkWordsByExisting } from '../../../components/utils/parseBulkWords';
import { Toast } from '../../../components/utils/messages';
import { correctNounCase, formatLocaleCount } from '../../../components/utils/functions';
import { useConfirm } from '../../../components/utils/useConfirm';

const IMPORT_HINT = 'Кожен рядок — слово, переклад, речення і переклад речення. Між ними — /, | або Tab. До 100 рядків за раз.';
const TEXTAREA_HINT = 'Вставте або введіть слова — по одному рядку на кожне.';

export default function BulkImportWordsForm() {
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const { activeItem } = useSelector((state) => state.wordSets);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const wordsInSetCount = activeItem?.words?.length ?? 0;

  const { words, errors } = useMemo(
    () => parseBulkWords(text, 'auto'),
    [text],
  );

  const { toAdd, skipped } = useMemo(
    () => partitionBulkWordsByExisting(words, activeItem?.words ?? []),
    [words, activeItem?.words],
  );

  const wordCountLabel = toAdd.length > 0
    ? formatLocaleCount(toAdd.length) + ' ' + correctNounCase(toAdd.length, 'слово', 'слова', 'слів')
    : null;

  const isReady = toAdd.length > 0 && errors.length === 0;
  const submitLabel = isReady
    ? `Додати ${wordCountLabel}`
    : 'Додати в набір';

  const submitHint = (() => {
    if (isSubmitting) return 'Додаємо…';
    if (errors.length > 0) return 'Виправте помилки в тексті';
    if (!text.trim()) return 'Вставте слова';
    if (words.length === 0) return 'Не знайдено жодного слова';
    if (toAdd.length === 0 && skipped > 0) return 'Усі слова вже є в наборі';
    if (skipped > 0) return `Буде додано ${toAdd.length} нових. ${skipped} уже є в наборі`;
    return 'Додати всі слова в набір';
  })();

  const onImport = async () => {
    if (!activeItem?.id || toAdd.length === 0) return;

    setIsSubmitting(true);
    try {
      const result = await dispatch(bulkImportWords({
        wordSetId: activeItem.id,
        words: toAdd,
      })).unwrap();

      const count = result?.count ?? toAdd.length;
      const skippedCount = skipped;

      let message;
      let severity = 'success';

      if (count === 0 && skippedCount > 0) {
        message = 'Усі слова вже є в наборі';
        severity = 'info';
      } else if (skippedCount > 0) {
        message = `Додано ${formatLocaleCount(count)} ${correctNounCase(count, 'слово', 'слова', 'слів')}. ${formatLocaleCount(skippedCount)} уже в наборі`;
      } else {
        message = `Додано ${formatLocaleCount(count)} ${correctNounCase(count, 'слово', 'слова', 'слів')}`;
      }

      setToast({ open: true, message, severity });
      setText('');
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || 'Не вдалося додати слова',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClearWordSet = async () => {
    if (!activeItem?.id || wordsInSetCount === 0) return;

    const confirmed = await confirm({
      message: 'Очистити набір? Усі слова буде видалено з набору. Скопіюйте список заздалегідь, якщо хочете зберегти копію.',
      confirmText: 'Очистити',
      confirmColor: 'error',
    });

    if (!confirmed) return;

    setIsClearing(true);
    try {
      const result = await dispatch(clearWordSetWords(activeItem.id)).unwrap();
      const cleared = result?.cleared ?? wordsInSetCount;

      setToast({
        open: true,
        message: cleared > 0
          ? `Набір очищено — видалено ${formatLocaleCount(cleared)} ${correctNounCase(cleared, 'слово', 'слова', 'слів')}`
          : 'Набір уже порожній',
        severity: cleared > 0 ? 'success' : 'info',
      });
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || 'Не вдалося очистити набір',
        severity: 'error',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Box className="bulk-import-words content-block">
        <Box className="bulk-import-words__header">
          <Typography variant="h6" component="h3" className="bulk-import-words__title">
            Додати слова списком
          </Typography>
          <Tooltip title={IMPORT_HINT} arrow placement="top">
            <IconButton size="small" className="bulk-import-words__info-btn" aria-label="Підказка про формат списку">
              <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>

        <Tooltip title={TEXTAREA_HINT} arrow placement="top" enterDelay={500}>
          <TextField
            multiline
            minRows={6}
            maxRows={14}
            fullWidth
            placeholder={BULK_WORDS_PLACEHOLDER}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="bulk-import-words__textarea"
          />
        </Tooltip>

        {errors.length > 0 && (
          <Box className="bulk-import-words__errors">
            {errors.slice(0, 5).map((error) => (
              <Typography key={error} component="p">{error}</Typography>
            ))}
            {errors.length > 5 && (
              <Typography component="p">…і ще {errors.length - 5} {correctNounCase(errors.length - 5, 'помилка', 'помилки', 'помилок')}</Typography>
            )}
          </Box>
        )}

        {skipped > 0 && errors.length === 0 && (
          <Typography className="bulk-import-words__skipped">
            {toAdd.length > 0
              ? `${formatLocaleCount(skipped)} ${correctNounCase(skipped, 'слово', 'слова', 'слів')} вже в наборі — не будуть додані`
              : 'Усі слова вже є в наборі'}
          </Typography>
        )}

        <Box className="bulk-import-words__footer">
          {wordsInSetCount > 0 && (
            <Tooltip
              title="Видалити всі слова з набору — зручно перед повторним імпортом відредагованого списку"
              arrow
              placement="top"
            >
              <span className="bulk-import-words__clear-wrap">
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={onClearWordSet}
                  disabled={isClearing || isSubmitting}
                  className="bulk-import-words__clear"
                >
                  {isClearing ? 'Очищуємо…' : 'Очистити набір'}
                </Button>
              </span>
            </Tooltip>
          )}
          <Tooltip title={submitHint} arrow placement="top">
            <span className="bulk-import-words__submit-wrap">
              <Button
                variant="contained"
                fullWidth
                onClick={onImport}
                disabled={isSubmitting || isClearing || !isReady}
                className="bulk-import-words__submit"
              >
                {submitLabel}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
