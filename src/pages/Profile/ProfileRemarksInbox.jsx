import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { fetchMyWordSetRemarks, deleteWordSetRemark } from '../../redux/slices/word-set-remarks';
import { formatFeedbackDate } from '../../components/utils/feedback';
import CircularLoading from '../../components/wrappers/CircularLoading';
import { Toast } from '../../components/utils/messages';

export default function ProfileRemarksInbox() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const inbox = useSelector((state) => state.wordSetRemarks.inbox);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    dispatch(fetchMyWordSetRemarks({ page: 1, limit: 50 }));
  }, [dispatch]);

  const onMarkDone = async (id) => {
    try {
      await dispatch(deleteWordSetRemark(id)).unwrap();
      setToast({ open: true, message: t('setRemark.markedDone'), severity: 'success' });
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('setRemark.deleteError'),
        severity: 'error',
      });
    }
  };

  return (
    <Box className="profile-remarks-inbox">
      <CircularLoading isLoading={inbox.status === 'loading'}>
        {inbox.items.length === 0 ? (
          <Typography className="admin-empty">{t('setRemark.empty')}</Typography>
        ) : (
          <Box className="profile-remarks-inbox__list">
            {inbox.items.map((item) => (
              <Accordion key={item.id} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box className="profile-remarks-inbox__summary">
                    <Typography className="profile-remarks-inbox__set">
                      {item.wordSet?.name || `#${item.word_set_id}`}
                    </Typography>
                    <Typography className="profile-remarks-inbox__meta">
                      {formatFeedbackDate(item.created_at)} · {item.reporter?.username || t('admin.guest')}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails className="profile-remarks-inbox__details">
                  {item.selected_text && (
                    <Typography className="profile-remarks-inbox__quote">«{item.selected_text}»</Typography>
                  )}
                  {item.comment && <Typography>{item.comment}</Typography>}
                  <Box className="profile-remarks-inbox__actions">
                    <Button component={Link} to={`/word-set/${item.word_set_id}`} size="small">
                      {t('setRemark.openSet')}
                    </Button>
                    <Button size="small" variant="contained" onClick={() => onMarkDone(item.id)}>
                      {t('setRemark.markDone')}
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </CircularLoading>

      <Toast {...toast} handleClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
