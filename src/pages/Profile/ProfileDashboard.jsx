import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Divider } from '@mui/material';

import { selectIsAuth, selectAuthStatus } from '../../redux/slices/auth';
import WordSetCardGroup from '../../components/WordSetCardGroup';
import WordSearchBlock from '../../components/WordSearchBlock';
import CreateNewWordSetForm from './components/CreateNewWordSetForm';
import CreateNewWordForm from './components/CreateNewWordForm';
import CircularLoading from '../../components/wrappers/CircularLoading';

export default function ProfileDashboard() {
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  
  if (!isAuth) {
    navigate('/');
  }

  return (
    <>
      <CircularLoading isLoading={authStatus === 'loading'}>
        <Box>
          <CreateNewWordSetForm />
          <Divider sx={{ my: 4 }} />
          <CreateNewWordForm />
        </Box>
      </CircularLoading>
    </>
  );
}