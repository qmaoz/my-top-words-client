import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';

import { selectIsAuth, updateUserPreferences } from '../redux/slices/auth';
import { SUPPORTED_LOCALES, getLocaleLabel } from './utils/locales';
import { changeUiLocale, DEFAULT_UI_LOCALE } from '../i18n';
import { useInlineEnd } from '../theme/useInlineEnd';

export default function LanguageSwitcher() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const { t, i18n } = useTranslation();
  const inlineEnd = useInlineEnd();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const current = SUPPORTED_LOCALES.some((locale) => locale.code === i18n.language)
    ? i18n.language
    : DEFAULT_UI_LOCALE;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (locale) => {
    handleClose();
    if (locale === current) return;

    changeUiLocale(locale);
    if (isAuth) {
      dispatch(updateUserPreferences({ ui_locale: locale }));
    }
  };

  const label = t('layout.language');

  return (
    <>
      <Tooltip title={label}>
        <IconButton
          size="small"
          className="language-switcher"
          onClick={handleOpen}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open ? 'true' : undefined}
          aria-controls={open ? 'language-switcher-menu' : undefined}
        >
          <TranslateIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        id="language-switcher-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: inlineEnd }}
        transformOrigin={{ vertical: 'top', horizontal: inlineEnd }}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <MenuItem
            key={locale.code}
            selected={locale.code === current}
            onClick={() => handleSelect(locale.code)}
          >
            <span className="language-switcher__item">
              {locale.code === current ? (
                <CheckIcon fontSize="inherit" className="language-switcher__check" />
              ) : (
                <span className="language-switcher__check-spacer" />
              )}
              {getLocaleLabel(locale.code)}
            </span>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
