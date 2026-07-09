import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Tab, Tabs } from '@mui/material';

import { selectAuthStatus, selectIsAdmin, selectIsAuth } from '../../redux/slices/auth';
import CircularLoading from '../../components/wrappers/CircularLoading';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const authStatus = useSelector(selectAuthStatus);

  useEffect(() => {
    if (authStatus !== 'loading' && (!isAuth || !isAdmin)) {
      navigate('/');
    }
  }, [isAuth, isAdmin, authStatus, navigate]);

  const currentTab = location.pathname === '/admin' ? '/admin/overview' : location.pathname;

  return (
    <Box className="container admin-page">
      <CircularLoading isLoading={authStatus === 'loading'}>
        <Box className="admin-page__header df">
          <h2>Адмін-панель</h2>
          <Tabs value={currentTab}>
            <Tab label="Огляд" value="/admin/overview" component={Link} to="overview" />
            <Tab label="Зворотний зв'язок" value="/admin/feedback" component={Link} to="feedback" />
            <Tab label="Користувачі" value="/admin/users" component={Link} to="users" />
          </Tabs>
        </Box>
        <Box className="admin-page__content">
          <Outlet />
        </Box>
      </CircularLoading>
    </Box>
  );
}
