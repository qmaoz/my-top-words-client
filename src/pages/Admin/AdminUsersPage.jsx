import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, IconButton, Pagination, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { ADMIN_USER_ID } from '../../components/utils/admin';
import { deleteAdminUser, fetchAdminUsers } from '../../redux/slices/admin';
import { selectUserData } from '../../redux/slices/auth';
import CircularLoading from '../../components/wrappers/CircularLoading';
import { Toast } from '../../components/utils/messages';

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUserData);
  const { users } = useSelector((state) => state.admin);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    dispatch(fetchAdminUsers({
      page,
      limit: 10,
      search: search || undefined,
    }));
  }, [dispatch, page, search]);

  const onSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const onDelete = async (user) => {
    if (user.id === currentUser?.id) {
      setToast({ open: true, message: 'Не можна видалити власний акаунт', severity: 'error' });
      return;
    }

    if (user.id === ADMIN_USER_ID) {
      setToast({ open: true, message: 'Не можна видалити обліковий запис адміністратора', severity: 'error' });
      return;
    }

    const confirmed = window.confirm(`Видалити користувача «${user.username}» (id: ${user.id})? Цю дію не можна скасувати.`);
    if (!confirmed) return;

    try {
      await dispatch(deleteAdminUser(user.id)).unwrap();
      setToast({ open: true, message: 'Користувача видалено', severity: 'success' });
    } catch (error) {
      const message = error?.message?.message || error?.message || 'Помилка видалення';
      setToast({ open: true, message, severity: 'error' });
    }
  };

  const canDelete = (user) => user.id !== currentUser?.id && user.id !== ADMIN_USER_ID;

  return (
    <>
      <Box className="admin-users">
        <form onSubmit={onSearch} className="admin-toolbar df gap-3 mb-3">
          <TextField
            label="Пошук за ім'ям"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            size="small"
            className="admin-toolbar__search"
          />
          <Button type="submit" variant="contained">Знайти</Button>
        </form>

        <CircularLoading isLoading={users.status === 'loading'}>
          {users.items.length === 0 ? (
            <Typography className="admin-empty">Користувачів не знайдено</Typography>
          ) : (
            <Box className="admin-table-wrap content-block">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ім'я користувача</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.items.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        {user.username}
                        {user.id === ADMIN_USER_ID && <span className="admin-badge">адмін</span>}
                        {user.id === currentUser?.id && <span className="admin-badge admin-badge--self">ви</span>}
                      </td>
                      <td className="admin-table__actions">
                        <Tooltip title={canDelete(user) ? 'Видалити' : 'Видалення недоступне'}>
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => onDelete(user)}
                              disabled={!canDelete(user)}
                              aria-label="delete user"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}

          {users.totalPages > 1 && (
            <Stack spacing={2} className="admin-pagination aic">
              <Pagination
                count={users.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
              />
            </Stack>
          )}
        </CircularLoading>
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}
