import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';

import { selectIsAuth, selectAuthStatus } from '../../redux/slices/auth';
import CircularLoading from '../../components/wrappers/CircularLoading';

export default function ProfileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  
  useEffect(() => {
    if (!isAuth && authStatus !== 'loading') {
      navigate('/');
    }
  }, [isAuth, authStatus, navigate]);
  
  const currentTab = location.pathname === '/profile' ? '/profile/saved-word-sets' : location.pathname;

  return (
    <>
        <Box className="container profile-page">
          <CircularLoading isLoading={authStatus === 'loading'}>
            <Box className="df">
              <h2>Профіль</h2>
              <Tabs value={currentTab}>
                <Tab label="Збережені набори" value="/profile/saved-word-sets" component={Link} to="saved-word-sets" />
                <Tab label="Власні набори" value="/profile/own-word-sets" component={Link} to="own-word-sets" />
              </Tabs>
            </Box>
            <Box className="profile-page__content">
              <Outlet />
            </Box>
          </CircularLoading>
        </Box>
    </>
  );
}