import { Link } from 'react-router';
import { Menu, MenuItem, IconButton, Avatar, Paper } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { logout, selectIsAuth, selectUserData } from '../../redux/slices/auth';

import userIcon from '/img/icons/user.svg';
import { deepOrange, red } from '@mui/material/colors';

export default function Header() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const userData = useSelector(selectUserData);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClickLogout = () => {
    handleClose();
    if (window.confirm('Ви дійсно хочете вийти з акаунту?')) {
      dispatch(logout());
      window.localStorage.removeItem('token');
    }
  };

  function stringAvatar(name) {
    return {
      children: `${name[0]}`,
    };
  }

  return (
    <>
      <Paper elevation={2} className='mb-3'>
        <header>
          <div className="container df jcsb">
            <h1 className="typewriter-animation"><Link to='/'>My Top Words</Link></h1>
            {isAuth ? (
              <div className="header__user-profile df aic">
                <div className="username" style={{ marginRight: '10px' }}>
                  Hallo, {userData.username}!
                </div>

                {/* <Link to='/profile'>Профіль</Link>
                <Link onClick={onClickLogout} sx={{ color: 'error.main' }}>Вийти</Link> */}
                
                {/* <MenuItem component={Link} to="/profile">
                  Профіль
                </MenuItem>
                <MenuItem onClick={onClickLogout} sx={{ color: 'error.main' }}>
                  Вийти
                </MenuItem> */}

                <IconButton onClick={handleClick} size="small" sx={{ p: 0 }}>
                  {/* {...stringAvatar(userData.username)} */}
                  <Avatar src={userIcon} alt={userData.username} sx={{ width: 40, height: 40 }} />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem component={Link} to="/profile">
                    Профіль
                  </MenuItem>
                  <MenuItem onClick={onClickLogout} sx={{ color: 'error.main' }}>
                    Вийти
                  </MenuItem>
                </Menu>
              </div>
            ) :
              <div className="sign-up-or-login">
                <Link to="/sign-up">Зареєструватися</Link> / <Link to='/login'>Увійти</Link>
              </div>}
          </div>
        </header>
      </Paper>
    </>
  );
}
