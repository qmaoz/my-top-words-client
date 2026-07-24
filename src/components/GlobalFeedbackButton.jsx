import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import { Dialog, DialogContent, DialogTitle, Fab, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import FeedbackForm from './FeedbackForm';

export default function GlobalFeedbackButton() {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={t('feedback.fabTooltip')} placement="left">
        <Fab
          color="primary"
          size="medium"
          className="global-feedback-fab"
          onClick={() => setOpen(true)}
          aria-label={t('feedback.fabAria')}
        >
          <FeedbackOutlinedIcon />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle className="global-feedback-dialog__title">
          {t('feedback.dialogTitle')}
          <IconButton onClick={() => setOpen(false)} aria-label={t('common.cancel')} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FeedbackForm
            defaultPageUrl={location.pathname || '/'}
            onSubmitted={() => setOpen(false)}
            embedded
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
