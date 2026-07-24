import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, MenuItem, Paper, TextField,
} from '@mui/material';

import { getFeedbackTypes } from './utils/feedback';
import { resetSubmitStatus, submitFeedback } from '../redux/slices/admin';
import { Toast } from './utils/messages';

export default function FeedbackForm({ defaultPageUrl = '', onSubmitted, embedded = false }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const submitStatus = useSelector((state) => state.admin.submitStatus);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const feedbackTypes = getFeedbackTypes();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: 'bug',
      message: '',
      page_url: defaultPageUrl,
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    setValue('page_url', defaultPageUrl);
  }, [defaultPageUrl, setValue]);

  useEffect(() => {
    if (submitStatus === 'succeeded') {
      setToast({ open: true, message: t('feedback.sent'), severity: 'success' });
      reset({ type: 'bug', message: '', page_url: defaultPageUrl });
      dispatch(resetSubmitStatus());
      onSubmitted?.();
    }

    if (submitStatus === 'failed') {
      setToast({ open: true, message: t('feedback.sendError'), severity: 'error' });
      dispatch(resetSubmitStatus());
    }
  }, [submitStatus, reset, defaultPageUrl, dispatch, t, onSubmitted]);

  const onSubmit = async (values) => {
    try {
      await dispatch(submitFeedback({
        type: values.type,
        message: values.message.trim(),
        page_url: values.page_url?.trim() || undefined,
      })).unwrap();
    } catch (error) {
      const message = error?.message?.message || error?.message || t('feedback.unknownError');
      setToast({ open: true, message, severity: 'error' });
      dispatch(resetSubmitStatus());
    }
  };

  const form = (
        <form onSubmit={handleSubmit(onSubmit)} className="feedback-form__body" autoComplete="off">
          <Controller
            name="type"
            control={control}
            rules={{ required: t('feedback.selectType') }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t('feedback.type')}
                fullWidth
                margin="none"
                error={Boolean(errors.type)}
                helperText={errors.type?.message}
              >
                {feedbackTypes.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            {...register('message', {
              required: t('feedback.enterText'),
              minLength: { value: 1, message: t('feedback.enterText') },
              maxLength: { value: 2000, message: t('feedback.max2000') },
              validate: {
                notBlank: (v) => v.trim().length >= 1 || t('feedback.enterText'),
              },
            })}
            label={t('feedback.text')}
            multiline
            minRows={4}
            fullWidth
            margin="none"
            error={Boolean(errors.message)}
            helperText={errors.message?.message}
            autoComplete="off"
          />

          <TextField
            {...register('page_url', {
              maxLength: { value: 500, message: t('feedback.max500') },
              validate: {
                internalPath: (value) => {
                  const trimmed = value?.trim();
                  if (!trimmed) return true;
                  return /^\/[a-zA-Z0-9/_-]*$/.test(trimmed) || t('feedback.onlyInternalPath');
                },
              },
            })}
            label={t('feedback.pageOptional')}
            placeholder="/word-set/5"
            fullWidth
            margin="none"
            error={Boolean(errors.page_url)}
            helperText={errors.page_url?.message}
            autoComplete="off"
          />

          <Box className="feedback-form__actions">
            <Button
              type="submit"
              variant="contained"
              disabled={submitStatus === 'loading'}
            >
              {t('feedback.submit')}
            </Button>
          </Box>
        </form>
  );

  return (
    <>
      {embedded ? form : (
        <Paper elevation={1} className="feedback-form content-block">
          {form}
        </Paper>
      )}
      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
