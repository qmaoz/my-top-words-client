import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const { t } = useTranslation();
  const [options, setOptions] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((opts) => {
    const normalized = typeof opts === 'string' ? { message: opts } : opts;

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setOptions({
        title: normalized.title ?? null,
        message: normalized.message ?? '',
        confirmText: normalized.confirmText ?? t('common.yes'),
        cancelText: normalized.cancelText ?? t('common.cancel'),
        confirmColor: normalized.confirmColor ?? 'primary',
      });
    });
  }, [t]);

  const handleClose = (result) => {
    setOptions(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={Boolean(options)}
        onClose={() => handleClose(false)}
        maxWidth="sm"
        fullWidth
        className="confirm-dialog"
      >
        {options?.title && <DialogTitle>{options.title}</DialogTitle>}
        <DialogContent>
          <DialogContentText component="div">{options?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)}>{options?.cancelText}</Button>
          <Button
            onClick={() => handleClose(true)}
            color={options?.confirmColor}
            variant="contained"
            autoFocus
          >
            {options?.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }

  return context;
}
