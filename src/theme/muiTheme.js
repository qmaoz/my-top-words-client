import { createTheme } from '@mui/material/styles';

import palette from './palette.js';

const { mui } = palette;

export const theme = createTheme({
  palette: {
    primary: {
      main: mui.primary.main,
      light: mui.primary.light,
      dark: mui.primary.dark,
    },
    secondary: {
      main: mui.secondary.main,
      light: mui.secondary.light,
      dark: mui.secondary.dark,
    },
    success: {
      main: mui.success.main,
      light: mui.success.light,
      dark: mui.success.dark,
    },
    error: {
      main: mui.error.main,
      light: mui.error.light,
      dark: mui.error.dark,
    },
    warning: {
      main: mui.warning.main,
      light: mui.warning.light,
      dark: mui.warning.dark,
    },
    background: {
      default: palette.background.muiDefault,
      paper: palette.background.paper,
    },
    text: {
      primary: mui.text.primary,
      secondary: mui.text.secondary,
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
          boxShadow: `0 2px 8px ${mui.primary.shadow}`,
          '&:hover': {
            boxShadow: `0 3px 12px ${mui.primary.shadowHover}`,
          },
        },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${mui.primary.gradientStart} 0%, ${mui.primary.gradientEnd} 100%)`,
          '&:hover': {
            backgroundImage: `linear-gradient(135deg, ${mui.primary.gradientHoverStart} 0%, ${mui.primary.gradientHoverEnd} 100%)`,
          },
        },
        containedSecondary: {
          backgroundImage: `linear-gradient(135deg, ${mui.secondary.gradientStart} 0%, ${mui.secondary.gradientEnd} 100%)`,
          '&:hover': {
            backgroundImage: `linear-gradient(135deg, ${mui.secondary.gradientHoverStart} 0%, ${mui.secondary.gradientHoverEnd} 100%)`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: `0 2px 16px ${mui.primary.shadowPaper}`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: mui.primary.hoverBg,
          },
        },
      },
    },
  },
});

export default theme;
