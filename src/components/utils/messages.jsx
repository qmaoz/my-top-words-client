import { Typography } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import { getUserFacingError } from './functions';
import { useInlineEnd } from '../../theme/useInlineEnd';
import { tr } from './translate';

export function getWordSetLoadError() {
  return tr('common.wordSetLoadError');
}

export function WarningMessage({ message, className = null }) {
  return (
    <Typography variant="body1" color="text.secondary" className={(className && className.trim() != '') ? className : undefined} sx={{ textAlign: 'start', width: '100%', mt: 2 }}>
      {message}
    </Typography>
  );
}

export function ErrorMessage({ message, className = null }) {
  return (
    <Typography variant="h6" color="error" className={(className && className.trim() != '') ? className : undefined} sx={{ textAlign: 'center', width: '100%', my: 4 }}>
      {message}
    </Typography>
  );
}

export function Toast({ open, handleClose, message, severity = 'info', className = null }) {
  const inlineEnd = useInlineEnd();
  const fallback = tr('common.genericError');
  const displayMessage = severity === 'error'
    ? (getUserFacingError({ message }, fallback) || fallback)
    : message;

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: inlineEnd }}
      className={(className && className.trim() != '') ? className : undefined}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {displayMessage}
      </Alert>
    </Snackbar>
  );
}
