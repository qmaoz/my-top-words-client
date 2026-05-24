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
  
  if (!isAuth) {
    navigate('/');
  }
  
  const currentTab = location.pathname === '/profile' ? '/profile/word-sets' : location.pathname;

  return (
    <>
      <div className="container">
        <CircularLoading isLoading={authStatus === 'loading'}>
          <div className="df jcsb">
            <h2>Профіль</h2>
            <Tabs value={currentTab}>
              <Tab label="Набори" value="/profile/word-sets" component={Link} to="word-sets" />
              <Tab label="Лексика" value="/profile/words" component={Link} to="words" />
              <Tab label="Керування" value="/profile/dashboard" component={Link} to="dashboard" />
            </Tabs>
          </div>

          <Box sx={{ mt: 3 }}>
            <Outlet />
          </Box>
        </CircularLoading>
      </div>
    </>
  );
}