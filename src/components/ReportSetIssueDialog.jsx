import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography,
} from '@mui/material';

import { submitWordSetRemark } from '../redux/slices/word-set-remarks';
import { Toast } from './utils/messages';

export default function ReportSetIssueDialog({
  open,
  onClose,
  wordSetId,
  wordId = null,
  initialSelectedText = '',
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedText, setSelectedText] = useState(initialSelectedText);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (open) {
      setSelectedText(initialSelectedText || window.getSelection?.()?.toString?.()?.trim?.() || '');
      setComment('');
    }
  }, [open, initialSelectedText]);

  const canSubmit = Boolean(selectedText.trim() || comment.trim());

  const onSubmit = async () => {
    if (!canSubmit || !wordSetId) return;

    setIsSubmitting(true);
    try {
      await dispatch(submitWordSetRemark({
        wordSetId,
        wordId,
        selected_text: selectedText.trim() || undefined,
        comment: comment.trim() || undefined,
      })).unwrap();
      setToast({ open: true, message: t('setRemark.sent'), severity: 'success' });
      onClose?.();
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('setRemark.sendError'),
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{t('setRemark.title')}</DialogTitle>
        <DialogContent className="report-set-issue-dialog">
          <Typography className="report-set-issue-dialog__hint">
            {t('setRemark.hint')}
          </Typography>
          <TextField
            label={t('setRemark.selectedText')}
            value={selectedText}
            onChange={(event) => setSelectedText(event.target.value)}
            fullWidth
            margin="none"
            multiline
            minRows={2}
            autoComplete="off"
          />
          <TextField
            label={t('setRemark.commentOptional')}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            fullWidth
            margin="none"
            multiline
            minRows={3}
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? t('setRemark.sending') : t('setRemark.submit')}
          </Button>
        </DialogActions>
      </Dialog>
      <Toast {...toast} handleClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}
