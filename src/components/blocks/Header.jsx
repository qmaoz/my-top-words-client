import { Link } from 'react-router';
import { Menu, MenuItem, IconButton, Avatar, Paper, Box, Divider } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { logout, selectAuthStatus, selectIsAdmin, selectIsAuth, selectUserData } from '../../redux/slices/auth';
import {
  clearWordSetRemarks,
  fetchMyWordSetRemarks,
  selectQueuedRemarksTotal,
} from '../../redux/slices/word-set-remarks';
import { useConfirm } from '../utils/useConfirm';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Header() {
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const { t } = useTranslation();
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const authStatus = useSelector(selectAuthStatus);
  const userData = useSelector(selectUserData);
  const queuedRemarksTotal = useSelector(selectQueuedRemarksTotal);
  const showRemarksInbox = queuedRemarksTotal > 0;

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

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchMyWordSetRemarks({ status: 'queued', page: 1, limit: 1 }));
    } else {
      dispatch(clearWordSetRemarks());
    }
  }, [dispatch, isAuth]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClickLogout = async () => {
    handleClose();
    const confirmed = await confirm({
      message: t('layout.logoutConfirm'),
      confirmText: t('layout.logout'),
      confirmColor: 'error',
    });

    if (confirmed) {
      dispatch(logout());
      dispatch(clearWordSetRemarks());
    }
  };

  const initial = (userData?.username || '?').slice(0, 1).toUpperCase();

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
            <Box className="header__actions df">
              <Link to="/about" className="header__nav-link">{t('layout.about')}</Link>
              <LanguageSwitcher />
              {isAuth ? (
                <Box className="header__user-profile df aic">
                  <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-label={t('layout.accountMenu')}
                    className="header__avatar-btn"
                  >
                    <Avatar className="header__avatar">{initial}</Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem disabled className="header__menu-user">
                      {userData?.username}
                    </MenuItem>
                    <Divider />
                    <MenuItem component={Link} to="/profile" onClick={handleClose}>
                      {t('layout.profile')}
                    </MenuItem>
                    {showRemarksInbox && (
                      <MenuItem component={Link} to="/profile/remarks" onClick={handleClose}>
                        {t('layout.remarksInbox')}
                      </MenuItem>
                    )}
                    {isAdmin && (
                      <MenuItem component={Link} to="/admin" onClick={handleClose}>
                        {t('layout.admin')}
                      </MenuItem>
                    )}
                    <MenuItem onClick={onClickLogout} sx={{ color: 'error.main' }}>
                      {t('layout.logout')}
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                authStatus !== 'loading' && (
                  <Box className="sign-up-or-login">
                    <Link to="/sign-up">{t('layout.signUp')}</Link> / <Link to='/login'>{t('layout.login')}</Link>
                  </Box>
                )
              )}
            </Box>
          </Box>
        </header>
      </Paper>
    </>
  );
}
