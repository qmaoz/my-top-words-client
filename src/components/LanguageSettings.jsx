import { useTranslation } from 'react-i18next';
import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import InfoHint from './InfoHint';
import {
  MIN_SET_LOCALES,
  SUPPORTED_LOCALES,
  getLocaleLabel,
  getLocaleDisplay,
} from './utils/locales';

export default function LanguageSettings({
  locales,
  onChange,
  lockSourceLocale = false,
  showSourceLockedHint = false,
  disabled = false,
  showLabel = true,
}) {
  const { t } = useTranslation();
  const available = SUPPORTED_LOCALES.filter(
    (locale) => !locales.includes(locale.code),
  );

  const addLocale = (code) => {
    if (!code) return;
    onChange([...locales, code]);
  };

  const removeLocale = (index) => {
    if (locales.length <= MIN_SET_LOCALES) return;
    onChange(locales.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveLocale = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= locales.length) return;
    if (lockSourceLocale && (index === 0 || target === 0)) return;

    const next = [...locales];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Box className="language-settings">
      {showLabel && (
        <Typography component="p" className="language-settings__label">
          {t('wordSet.setLanguages')}
        </Typography>
      )}

      <Box className="language-settings__list" role="list">
        {locales.map((code, index) => (
          <Box
            key={code}
            className={`language-settings__item${index === 0 ? ' language-settings__item--source' : ''}`}
            role="listitem"
          >
            <span className="language-settings__item-order" aria-hidden="true">
              {index + 1}
            </span>
            <span className="language-settings__item-name">
              {getLocaleLabel(code)}
              {index === 0 && (
                <span className="language-settings__item-role">
                  {t('wordSet.sourceLocaleHint')}
                </span>
              )}
              {index === 0 && showSourceLockedHint && (
                <InfoHint title={t('wordSet.sourceLocaleLocked')} />
              )}
            </span>
            <Box className="language-settings__item-actions">
              <IconButton
                size="small"
                disabled={disabled || index === 0 || (lockSourceLocale && index === 1)}
                onClick={() => moveLocale(index, -1)}
                aria-label={t('wordSet.moveUp')}
                className="language-settings__item-btn"
              >
                <KeyboardArrowUpIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                disabled={
                  disabled
                  || index === locales.length - 1
                  || (lockSourceLocale && index === 0)
                }
                onClick={() => moveLocale(index, 1)}
                aria-label={t('wordSet.moveDown')}
                className="language-settings__item-btn"
              >
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                disabled={disabled || locales.length <= MIN_SET_LOCALES}
                onClick={() => removeLocale(index)}
                aria-label={t('wordSet.removeLanguage')}
                className="language-settings__item-btn language-settings__item-btn--danger"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {available.length > 0 && (
        <FormControl size="small" fullWidth className="language-settings__add" disabled={disabled}>
          <Select
            value=""
            displayEmpty
            onChange={(event) => addLocale(event.target.value)}
            renderValue={() => (
              <span className="language-settings__add-value">
                <AddIcon fontSize="inherit" />
                {t('wordSet.addLanguage')}
              </span>
            )}
            aria-label={t('wordSet.addLanguage')}
          >
            {available.map((locale) => (
              <MenuItem key={locale.code} value={locale.code}>
                {getLocaleDisplay(locale.code)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
}
