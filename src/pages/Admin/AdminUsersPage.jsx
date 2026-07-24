import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, IconButton, Pagination, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { deleteAdminUser, fetchAdminUsers } from '../../redux/slices/admin';
import { selectUserData } from '../../redux/slices/auth';
import CircularLoading from '../../components/wrappers/CircularLoading';
import { Toast } from '../../components/utils/messages';
import { useConfirm } from '../../components/utils/useConfirm';
import { formatFeedbackDate } from '../../components/utils/feedback';

const SORTABLE_COLUMNS = [
  { key: 'id', labelKey: 'admin.colId' },
  { key: 'username', labelKey: 'auth.username' },
  { key: 'wordSetsCount', labelKey: 'admin.colWordSets' },
  { key: 'wordsCount', labelKey: 'admin.colWords' },
  { key: 'createdAt', labelKey: 'admin.colRegistered' },
  { key: 'lastSeenAt', labelKey: 'admin.colLastSeen' },
];

function SortableHeader({ column, sortBy, sortDir, onSort, label }) {
  const isActive = sortBy === column;
  const indicator = isActive ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <th
      className={`admin-table__sortable${isActive ? ' admin-table__sortable--active' : ''}`}
      onClick={() => onSort(column)}
      aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}{indicator}
    </th>
  );
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const currentUser = useSelector(selectUserData);
  const { users } = useSelector((state) => state.admin);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    dispatch(fetchAdminUsers({
      page,
      limit: 10,
      search: search || undefined,
      sortBy,
      sortDir,
    }));
  }, [dispatch, page, search, sortBy, sortDir]);

  const onSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const onSort = (column) => {
    setPage(1);
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortDir('asc');
  };

  const onDelete = async (user) => {
    if (user.id === currentUser?.id) {
      setToast({ open: true, message: t('admin.deleteSelfError'), severity: 'error' });
      return;
    }

    if (user.is_admin) {
      setToast({ open: true, message: t('admin.deleteAdminError'), severity: 'error' });
      return;
    }

    const confirmed = await confirm({
      message: t('admin.deleteUserConfirm', { username: user.username }),
      confirmText: t('common.delete'),
      confirmColor: 'error',
    });

    if (!confirmed) return;

    try {
      await dispatch(deleteAdminUser(user.id)).unwrap();
      setToast({ open: true, message: t('admin.userDeleted'), severity: 'success' });
    } catch (error) {
      const message = error?.message?.message || error?.message || t('admin.deleteUserError');
      setToast({ open: true, message, severity: 'error' });
    }
  };

  const canDelete = (user) => user.id !== currentUser?.id && !user.is_admin;

  return (
    <>
      <Box className="admin-users">
        <form onSubmit={onSearch} className="admin-toolbar df gap-3" autoComplete="off">
          <TextField
            label={t('admin.searchByName')}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            size="small"
            className="admin-toolbar__search"
            autoComplete="off"
          />
          <Button type="submit" variant="contained">{t('common.find')}</Button>
        </form>

        <CircularLoading isLoading={users.status === 'loading'}>
          {users.items.length === 0 ? (
            <Typography className="admin-empty">{t('admin.usersNotFound')}</Typography>
          ) : (
            <Box className="admin-table-wrap content-block">
              <table className="admin-table">
                <thead>
                  <tr>
                    {SORTABLE_COLUMNS.map((column) => (
                      <SortableHeader
                        key={column.key}
                        column={column.key}
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSort={onSort}
                        label={t(column.labelKey)}
                      />
                    ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.items.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        {user.username}
                        {user.is_admin && <span className="admin-badge">{t('admin.admin')}</span>}
                        {user.id === currentUser?.id && <span className="admin-badge admin-badge--self">{t('admin.you')}</span>}
                      </td>
                      <td>{user.word_sets_count}</td>
                      <td>{user.words_count}</td>
                      <td>{formatFeedbackDate(user.created_at)}</td>
                      <td>{formatFeedbackDate(user.last_seen_at)}</td>
                      <td className="admin-table__actions">
                        <Tooltip title={canDelete(user) ? t('common.delete') : t('admin.cannotDeleteUser')}>
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => onDelete(user)}
                              disabled={!canDelete(user)}
                              aria-label={t('admin.deleteUser')}
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
