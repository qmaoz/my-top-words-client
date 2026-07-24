import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Pagination, Stack, TextField, Typography,
} from '@mui/material';

import {
  formatFeedbackDate,
  getFeedbackStatuses,
  getFeedbackStatusLabel,
  getFeedbackTypeLabel,
} from '../../components/utils/feedback';
import { fetchAdminFeedback, updateAdminFeedback } from '../../redux/slices/admin';
import CircularLoading from '../../components/wrappers/CircularLoading';
import { Toast } from '../../components/utils/messages';

export default function AdminFeedbackPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { feedback } = useSelector((state) => state.admin);
  const feedbackStatuses = getFeedbackStatuses();
  const statusOptions = feedbackStatuses.filter((item) => item.value !== 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { status: 'queued', admin_note: '' },
    mode: 'onSubmit',
  });

  useEffect(() => {
    dispatch(fetchAdminFeedback({
      page,
      limit: 10,
      status: statusFilter,
      search: search || undefined,
    }));
  }, [dispatch, page, statusFilter, search]);

  useEffect(() => {
    if (selectedItem) {
      reset({
        status: selectedItem.status,
        admin_note: selectedItem.admin_note || '',
      });
    }
  }, [selectedItem, reset]);

  const onSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const onOpenItem = (item) => setSelectedItem(item);
  const onCloseDialog = () => setSelectedItem(null);

  const onSave = async (values) => {
    if (!selectedItem) return;

    try {
      await dispatch(updateAdminFeedback({
        id: selectedItem.id,
        status: values.status,
        admin_note: values.admin_note,
      })).unwrap();
      setToast({ open: true, message: t('admin.changesSaved'), severity: 'success' });
      onCloseDialog();
    } catch (error) {
      const message = error?.message?.message || error?.message || t('admin.saveError');
      setToast({ open: true, message, severity: 'error' });
    }
  };

  return (
    <>
      <Box className="admin-feedback">
        <form onSubmit={onSearch} className="admin-toolbar df gap-3" autoComplete="off">
          <TextField
            select
            label={t('admin.status')}
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value);
            }}
            size="small"
            className="admin-toolbar__filter admin-toolbar__filter--status"
            slotProps={{ inputLabel: { shrink: true } }}
          >
            {feedbackStatuses.map((item) => (
              <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('admin.searchMessages')}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            size="small"
            className="admin-toolbar__search"
            autoComplete="off"
          />

          <Button type="submit" variant="contained">{t('common.find')}</Button>
        </form>

        <CircularLoading isLoading={feedback.status === 'loading'}>
          {feedback.items.length === 0 ? (
            <Typography className="admin-empty">{t('admin.messagesNotFound')}</Typography>
          ) : (
            <Box className="admin-table-wrap content-block">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('admin.colType')}</th>
                    <th>{t('admin.colText')}</th>
                    <th>{t('admin.colPage')}</th>
                    <th>{t('admin.colAuthor')}</th>
                    <th>{t('admin.status')}</th>
                    <th>{t('admin.colDate')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{getFeedbackTypeLabel(item.type)}</td>
                      <td className="admin-table__message">{item.message}</td>
                      <td>{item.page_url || '—'}</td>
                      <td>{item.author?.username || t('admin.guest')}</td>
                      <td>
                        <span className={`admin-status admin-status--${item.status}`}>
                          {getFeedbackStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="text-nowrap">{formatFeedbackDate(item.created_at)}</td>
                      <td>
                        <Button size="small" onClick={() => onOpenItem(item)}>{t('admin.open')}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}

          {feedback.totalPages > 1 && (
            <Stack spacing={2} className="admin-pagination aic">
              <Pagination
                count={feedback.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
              />
            </Stack>
          )}
        </CircularLoading>
      </Box>

      <Dialog open={Boolean(selectedItem)} onClose={onCloseDialog} fullScreen>
        <DialogTitle>{t('admin.messageNo', { id: selectedItem?.id })}</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box className="admin-feedback-detail">
              <Typography><strong>{t('admin.labelType')}</strong> {getFeedbackTypeLabel(selectedItem.type)}</Typography>
              <Typography><strong>{t('admin.labelAuthor')}</strong> {selectedItem.author?.username || t('admin.guest')}</Typography>
              <Typography><strong>{t('admin.labelPage')}</strong> {selectedItem.page_url || '—'}</Typography>
              <Typography><strong>{t('admin.labelDate')}</strong> {formatFeedbackDate(selectedItem.created_at)}</Typography>
              <Typography className="admin-feedback-detail__message">{selectedItem.message}</Typography>

              <form id="feedback-edit-form" onSubmit={handleSubmit(onSave)} autoComplete="off">
                <TextField
                  {...register('status', { required: true })}
                  select
                  label={t('admin.status')}
                  fullWidth
                  margin="none"
                  error={Boolean(errors.status)}
                >
                  {statusOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  {...register('admin_note', {
                    maxLength: { value: 2000, message: t('feedback.max2000') },
                  })}
                  label={t('admin.adminNote')}
                  multiline
                  minRows={3}
                  fullWidth
                  margin="none"
                  error={Boolean(errors.admin_note)}
                  helperText={errors.admin_note?.message}
                  autoComplete="off"
                />
              </form>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog}>{t('common.cancel')}</Button>
          <Button type="submit" form="feedback-edit-form" variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
