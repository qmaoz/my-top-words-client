import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Pagination, Stack, TextField, Typography,
} from '@mui/material';

import {
  FEEDBACK_STATUSES,
  formatFeedbackDate,
  getFeedbackStatusLabel,
  getFeedbackTypeLabel,
} from '../../components/utils/feedback';
import { fetchAdminFeedback, updateAdminFeedback } from '../../redux/slices/admin';
import CircularLoading from '../../components/wrappers/CircularLoading';
import { Toast } from '../../components/utils/messages';

const STATUS_OPTIONS = FEEDBACK_STATUSES.filter((item) => item.value !== 'all');

export default function AdminFeedbackPage() {
  const dispatch = useDispatch();
  const { feedback } = useSelector((state) => state.admin);
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
      setToast({ open: true, message: 'Зміни збережено', severity: 'success' });
      onCloseDialog();
    } catch (error) {
      const message = error?.message?.message || error?.message || 'Помилка збереження';
      setToast({ open: true, message, severity: 'error' });
    }
  };

  return (
    <>
      <Box className="admin-feedback">
        <form onSubmit={onSearch} className="admin-toolbar df gap-3 mb-3">
          <TextField
            select
            label="Статус"
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value);
            }}
            size="small"
            className="admin-toolbar__filter admin-toolbar__filter--status"
            slotProps={{ inputLabel: { shrink: true } }}
          >
            {FEEDBACK_STATUSES.map((item) => (
              <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Пошук у повідомленнях"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            size="small"
            className="admin-toolbar__search"
          />

          <Button type="submit" variant="contained">Знайти</Button>
        </form>

        <CircularLoading isLoading={feedback.status === 'loading'}>
          {feedback.items.length === 0 ? (
            <Typography className="admin-empty">Повідомлень не знайдено</Typography>
          ) : (
            <Box className="admin-table-wrap content-block">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Тип</th>
                    <th>Текст</th>
                    <th>Сторінка</th>
                    <th>Автор</th>
                    <th>Статус</th>
                    <th>Дата</th>
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
                      <td>{item.author?.username || 'Гість'}</td>
                      <td>
                        <span className={`admin-status admin-status--${item.status}`}>
                          {getFeedbackStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="text-nowrap">{formatFeedbackDate(item.created_at)}</td>
                      <td>
                        <Button size="small" onClick={() => onOpenItem(item)}>Відкрити</Button>
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

      <Dialog open={Boolean(selectedItem)} onClose={onCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Повідомлення #{selectedItem?.id}</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box className="admin-feedback-detail">
              <Typography><strong>Тип:</strong> {getFeedbackTypeLabel(selectedItem.type)}</Typography>
              <Typography><strong>Автор:</strong> {selectedItem.author?.username || 'Гість'}</Typography>
              <Typography><strong>Сторінка:</strong> {selectedItem.page_url || '—'}</Typography>
              <Typography><strong>Дата:</strong> {formatFeedbackDate(selectedItem.created_at)}</Typography>
              <Typography className="admin-feedback-detail__message">{selectedItem.message}</Typography>

              <form id="feedback-edit-form" onSubmit={handleSubmit(onSave)}>
                <TextField
                  {...register('status', { required: true })}
                  select
                  label="Статус"
                  fullWidth
                  margin="normal"
                  error={Boolean(errors.status)}
                >
                  {STATUS_OPTIONS.map((item) => (
                    <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  {...register('admin_note', {
                    maxLength: { value: 2000, message: 'Максимум 2000 символів' },
                  })}
                  label="Примітка адміністратора"
                  multiline
                  minRows={3}
                  fullWidth
                  margin="normal"
                  error={Boolean(errors.admin_note)}
                  helperText={errors.admin_note?.message}
                />
              </form>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog}>Скасувати</Button>
          <Button type="submit" form="feedback-edit-form" variant="contained">Зберегти</Button>
        </DialogActions>
      </Dialog>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
