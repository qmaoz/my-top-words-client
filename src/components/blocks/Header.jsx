import { Link } from 'react-router';
import { Menu, MenuItem, IconButton, Avatar, Paper, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { logout, selectAuthStatus, selectIsAdmin, selectIsAuth, selectUserData } from '../../redux/slices/auth';

export default function Header() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const authStatus = useSelector(selectAuthStatus);
  const userData = useSelector(selectUserData);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const logoRef = useRef(null);
  const [logoWidth, setLogoWidth] = useState(null);

  useEffect(() => {
    if (logoRef.current) {
      const width = logoRef.current.scrollWidth;
      const text = logoRef.current.textContent || '';
      const charCount = text.length;
      setLogoWidth(width);
      logoRef.current.style.setProperty('--typewriter-steps', charCount);
    }
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClickLogout = () => {
    handleClose();
    if (window.confirm('Підтверджуєте вихід з акаунту?')) {
      dispatch(logout());
    }
  };

  return (
    <>
      <Paper elevation={2} className='mb-3'>
        <header>
          <Box className="container df">
            <h1 
              ref={logoRef} 
              className="typewriter-animation"
              style={logoWidth ? { '--typewriter-width': `${logoWidth}px` } : {}}
            >
              <Link to='/'>My Top Words</Link>
            </h1>
            {isAuth ? (
              <Box className="header__user-profile df">
                <span className="header__username">{userData?.username}</span>
                <p className='m-0'>/</p>
                <Link to='/profile'>Профіль</Link>
                {isAdmin && <>
                  <p className='m-0'>/</p>
                  <Link to='/admin'>Адмін</Link>
                </>}
                <p className='m-0'>/</p>
                <Link onClick={onClickLogout} className='logout-button'>Вийти</Link>
                
                {/* <MenuItem component={Link} to="/profile">
                  Профіль
                </MenuItem>
                <MenuItem onClick={onClickLogout} sx={{ color: 'error.main' }}>
                  Вийти
                </MenuItem> */}

                {/* <IconButton onClick={handleClick} size="small" sx={{ p: 0 }}> */}
                  {/* {...stringAvatar(userData.username)} */}
                  {/* <Avatar src={userIcon} alt={userData.username} sx={{ width: 40, height: 40 }} /> */}
                {/* </IconButton> */}

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
              </Box>
            ) : <>
              {authStatus !== 'loading' && <>
                <Box className="sign-up-or-login">
                  <Link to="/sign-up">Зареєструватися</Link> / <Link to='/login'>Увійти</Link>
                </Box>
              </>}
            </>}
          </Box>
        </header>
      </Paper>
    </>
  );
}
