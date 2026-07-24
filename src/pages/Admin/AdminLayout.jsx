import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Tab, Tabs } from '@mui/material';

import { selectAuthStatus, selectIsAdmin, selectIsAuth } from '../../redux/slices/auth';
import CircularLoading from '../../components/wrappers/CircularLoading';

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const authStatus = useSelector(selectAuthStatus);

  const canAccessAdmin = authStatus === 'loaded' && isAuth && isAdmin;

  useEffect(() => {
    if (authStatus !== 'loading' && !canAccessAdmin) {
      navigate('/');
    }
  }, [canAccessAdmin, authStatus, navigate]);

  const currentTab = location.pathname === '/admin' ? '/admin/overview' : location.pathname;

  return (
    <Box className="container admin-page">
      <CircularLoading isLoading={authStatus === 'loading'}>
        <Box className="admin-page__header df">
          <h2>{t('admin.title')}</h2>
          <Tabs value={currentTab}>
            <Tab label={t('admin.tabOverview')} value="/admin/overview" component={Link} to="overview" />
            <Tab label={t('admin.tabFeedback')} value="/admin/feedback" component={Link} to="feedback" />
            <Tab label={t('admin.tabUsers')} value="/admin/users" component={Link} to="users" />
          </Tabs>
        </Box>
        <Box className="admin-page__content">
          {canAccessAdmin ? <Outlet /> : null}
        </Box>
      </CircularLoading>
    </Box>
  );
}
