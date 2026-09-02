import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { getLocaleDir } from '../components/utils/locales';
import { createAppTheme } from './muiTheme';

const ltrCache = createCache({ key: 'mui', prepend: true });
const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
  prepend: true,
});

export default function AppThemeProvider({ children }) {
  const { i18n } = useTranslation();
  const direction = getLocaleDir(i18n.language) === 'rtl' ? 'rtl' : 'ltr';
  const theme = useMemo(() => createAppTheme(direction), [direction]);
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
