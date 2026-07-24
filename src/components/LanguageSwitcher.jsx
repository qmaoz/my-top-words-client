import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MenuItem, Select } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

import { selectIsAuth, updateUserPreferences } from '../redux/slices/auth';
import { SUPPORTED_LOCALES, getLocaleLabel } from './utils/locales';
import { changeUiLocale, DEFAULT_UI_LOCALE } from '../i18n';

export default function LanguageSwitcher() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const { t, i18n } = useTranslation();
  const current = SUPPORTED_LOCALES.some((locale) => locale.code === i18n.language)
    ? i18n.language
    : DEFAULT_UI_LOCALE;

  const handleChange = (event) => {
    const locale = event.target.value;
    if (locale === current) return;

    // Applies immediately and persists to localStorage for everyone;
    // logged-in users also keep it as their global preference in the database.
    changeUiLocale(locale);
    if (isAuth) {
      dispatch(updateUserPreferences({ ui_locale: locale }));
    }
  };

  return (
    <Select
      size="small"
      value={current}
      onChange={handleChange}
      className="language-switcher"
      aria-label={t('layout.language')}
      sx={{
        color: 'var(--on-primary)',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--on-primary) !important',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--on-primary) !important',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--on-primary) !important',
        },
        '& .MuiSvgIcon-root': {
          color: 'var(--on-primary)',
        },
      }}
      renderValue={(code) => (
        <span className="language-switcher__value">
          <TranslateIcon fontSize="inherit" />
          {getLocaleLabel(code)}
        </span>
      )}
    >
      {SUPPORTED_LOCALES.map((locale) => (
        <MenuItem key={locale.code} value={locale.code}>
          {getLocaleLabel(locale.code)}
        </MenuItem>
      ))}
    </Select>
  );
}
