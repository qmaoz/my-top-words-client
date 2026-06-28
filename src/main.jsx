import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import App from './App.jsx';
import store from './redux/store';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D9488',
      light: '#CCFBF1',
      dark: '#0F766E',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#D97706',
    },
    success: {
      main: '#10B981',
      light: '#D1FAE5',
      dark: '#059669',
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#D97706',
    },
    background: {
      default: '#F0FDFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#134E4A',
      secondary: '#5F8B8A',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(13, 148, 136, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(13, 148, 136, 0.3)',
          },
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
          '&:hover': {
            backgroundImage: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
          },
        },
        containedSecondary: {
          backgroundImage: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
          '&:hover': {
            backgroundImage: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px rgba(13, 148, 136, 0.08)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
          },
        },
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </>,
);
