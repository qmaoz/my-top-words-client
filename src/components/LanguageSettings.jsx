import { useTranslation } from 'react-i18next';
import {
  Box, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';

import {
  SUPPORTED_LOCALES,
  getLocaleLabel,
  getLocaleDisplay,
} from './utils/locales';

export default function LanguageSettings({
  sourceLocale,
  translationLocales,
  onSourceChange,
  onTranslationChange,
  disableSourceChange = false,
  disabled = false,
}) {
  const { t } = useTranslation();
  const available = SUPPORTED_LOCALES.filter(
    (locale) => locale.code !== sourceLocale && !translationLocales.includes(locale.code),
  );

  const addLocale = (code) => {
    if (!code) return;
    onTranslationChange([...translationLocales, code]);
  };

  const removeLocale = (code) => {
    const next = translationLocales.filter((locale) => locale !== code);
    onTranslationChange(next.length > 0 ? next : ['uk']);
  };

  const moveLocale = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= translationLocales.length) return;
    const next = [...translationLocales];
    [next[index], next[target]] = [next[target], next[index]];
    onTranslationChange(next);
  };

  return (
    <Box className="language-settings">
      <Box className="language-settings__row">
        <FormControl size="small" className="language-settings__source" disabled={disabled || disableSourceChange}>
          <InputLabel id="source-locale-label">{t('wordSet.sourceLocaleLabel')}</InputLabel>
          <Select
            labelId="source-locale-label"
            label={t('wordSet.sourceLocaleLabel')}
            value={sourceLocale}
            onChange={(event) => onSourceChange(event.target.value)}
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <MenuItem
                key={locale.code}
                value={locale.code}
                disabled={translationLocales.includes(locale.code)}
              >
                {getLocaleDisplay(locale.code)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {disableSourceChange && (
          <Tooltip title={t('wordSet.sourceLocaleLocked')} arrow>
            <Typography component="span" className="language-settings__hint">
              {t('wordSet.locked')}
            </Typography>
          </Tooltip>
        )}
      </Box>

      <Box className="language-settings__translations">
        <Typography component="p" className="language-settings__label">
          {t('wordSet.translationLocalesLabel')}
        </Typography>
        <Box className="language-settings__chips">
          {translationLocales.map((code, index) => (
            <Chip
              key={code}
              className="language-settings__chip"
              label={
                <Box component="span" className="language-settings__chip-inner">
                  <Box component="span" className="language-settings__chip-order">{index + 1}</Box>
                  {getLocaleLabel(code)}
                  <IconButton
                    size="small"
                    disabled={disabled || index === 0}
                    onClick={() => moveLocale(index, -1)}
                    aria-label={t('wordSet.moveLeft')}
                    className="language-settings__chip-btn"
                  >
                    <ArrowUpwardIcon fontSize="inherit" sx={{ transform: 'rotate(-90deg)' }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={disabled || index === translationLocales.length - 1}
                    onClick={() => moveLocale(index, 1)}
                    aria-label={t('wordSet.moveRight')}
                    className="language-settings__chip-btn"
                  >
                    <ArrowDownwardIcon fontSize="inherit" sx={{ transform: 'rotate(-90deg)' }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={disabled || translationLocales.length <= 1}
                    onClick={() => removeLocale(code)}
                    aria-label={t('wordSet.removeLanguage')}
                    className="language-settings__chip-btn"
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              }
            />
          ))}
        </Box>

        {available.length > 0 && (
          <FormControl size="small" className="language-settings__add" disabled={disabled}>
            <InputLabel id="add-locale-label">
              <Box component="span" className="df aic gap-1"><AddIcon fontSize="inherit" /> {t('wordSet.addLanguage')}</Box>
            </InputLabel>
            <Select
              labelId="add-locale-label"
              label={t('wordSet.addLanguage')}
              value=""
              onChange={(event) => addLocale(event.target.value)}
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
    </Box>
  );
}
