import { Typography } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';

export function WarningMessage({ message }) {
  return (
    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'left', width: '100%', mt: 2 }}>
      ⚠️ {message}
    </Typography>
  );
}

export function ErrorMessage({ message }) {
  return (
    <Typography variant="h6" color="error" sx={{ textAlign: 'center', width: '100%', my: 4 }}>
      ⚠️ {message}
    </Typography>
  );
}

export function Toast({ open, handleClose, message, severity = 'info' }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity} // 'error', 'warning', 'info', 'success'
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};