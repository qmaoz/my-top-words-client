import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { fetchWordSetRemarks, updateWordSetRemark } from '../redux/slices/word-set-remarks';
import { formatFeedbackDate } from './utils/feedback';
import { Toast } from './utils/messages';

export default function WordSetRemarksPanel({ wordSetId }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const forSet = useSelector((state) => state.wordSetRemarks.forSet);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (wordSetId) {
      dispatch(fetchWordSetRemarks({ wordSetId, status: 'queued', page: 1, limit: 30 }));
    }
  }, [dispatch, wordSetId]);

  const items = Number(forSet.wordSetId) === Number(wordSetId) ? forSet.items : [];

  const onMarkDone = async (id) => {
    try {
      await dispatch(updateWordSetRemark({ id, status: 'done' })).unwrap();
      setToast({ open: true, message: t('setRemark.markedDone'), severity: 'success' });
      dispatch(fetchWordSetRemarks({ wordSetId, status: 'queued', page: 1, limit: 30 }));
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('setRemark.updateError'),
        severity: 'error',
      });
    }
  };

  // Only the set owner sees this panel (WordSetPage gates it). Hide entirely when empty.
  if (items.length === 0) {
    return toast.open
      ? <Toast {...toast} handleClose={() => setToast({ ...toast, open: false })} />
      : null;
  }

  return (
    <Box className="word-set-remarks content-block">
      <Typography variant="h6" component="h3" className="word-set-remarks__title">
        {t('setRemark.panelTitle')}
      </Typography>

      <Box className="word-set-remarks__list">
        {items.map((item) => (
          <Accordion key={item.id} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className="word-set-remarks__summary">
                {formatFeedbackDate(item.created_at)} · {item.reporter?.username || t('admin.guest')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {item.selected_text && (
                <Typography className="word-set-remarks__quote">«{item.selected_text}»</Typography>
              )}
              {item.comment && <Typography>{item.comment}</Typography>}
              <Button size="small" variant="contained" onClick={() => onMarkDone(item.id)}>
                {t('setRemark.markDone')}
              </Button>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Toast {...toast} handleClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
