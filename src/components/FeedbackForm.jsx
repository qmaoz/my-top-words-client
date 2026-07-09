import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, MenuItem, Paper, TextField,
} from '@mui/material';

import { FEEDBACK_TYPES } from './utils/feedback';
import { resetSubmitStatus, submitFeedback } from '../redux/slices/admin';
import { Toast } from './utils/messages';

export default function FeedbackForm({ defaultPageUrl = '' }) {
  const dispatch = useDispatch();
  const submitStatus = useSelector((state) => state.admin.submitStatus);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const {
    register,
    handleSubmit,
    control,
    reset,
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
    if (submitStatus === 'succeeded') {
      setToast({ open: true, message: 'Повідомлення надіслано. Дякуємо.', severity: 'success' });
      reset({ type: 'bug', message: '', page_url: defaultPageUrl });
      dispatch(resetSubmitStatus());
    }

    if (submitStatus === 'failed') {
      setToast({ open: true, message: 'Не вдалося надіслати повідомлення', severity: 'error' });
      dispatch(resetSubmitStatus());
    }
  }, [submitStatus, reset, defaultPageUrl, dispatch]);

  const onSubmit = async (values) => {
    try {
      await dispatch(submitFeedback({
        type: values.type,
        message: values.message.trim(),
        page_url: values.page_url?.trim() || undefined,
      })).unwrap();
    } catch (error) {
      const message = error?.message?.message || error?.message || 'Невідома помилка';
      setToast({ open: true, message, severity: 'error' });
      dispatch(resetSubmitStatus());
    }
  };

  return (
    <>
      <Paper elevation={1} className="feedback-form content-block">
        <form onSubmit={handleSubmit(onSubmit)} className="feedback-form__body">
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Оберіть тип повідомлення' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Тип повідомлення"
                fullWidth
                margin="normal"
                error={Boolean(errors.type)}
                helperText={errors.type?.message}
              >
                {FEEDBACK_TYPES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            {...register('message', {
              required: 'Введіть текст повідомлення',
              minLength: { value: 10, message: 'Мінімум 10 символів' },
              maxLength: { value: 2000, message: 'Максимум 2000 символів' },
              validate: {
                notBlank: (v) => v.trim().length >= 10 || 'Мінімум 10 символів',
              },
            })}
            label="Текст повідомлення"
            multiline
            minRows={4}
            fullWidth
            margin="normal"
            error={Boolean(errors.message)}
            helperText={errors.message?.message}
          />

          <TextField
            {...register('page_url', {
              maxLength: { value: 500, message: 'Максимум 500 символів' },
            })}
            label="Адреса сторінки (необов'язково)"
            placeholder="/word-set/12"
            fullWidth
            margin="normal"
            error={Boolean(errors.page_url)}
            helperText={errors.page_url?.message || 'Наприклад: /about або /word-set/5'}
          />

          <Box className="feedback-form__actions">
            <Button
              type="submit"
              variant="contained"
              disabled={submitStatus === 'loading'}
            >
              Надіслати
            </Button>
          </Box>
        </form>
      </Paper>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
