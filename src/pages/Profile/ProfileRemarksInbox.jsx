import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, MenuItem, TextField, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { fetchMyWordSetRemarks, updateWordSetRemark } from '../../redux/slices/word-set-remarks';
import { formatFeedbackDate } from '../../components/utils/feedback';
import CircularLoading from '../../components/wrappers/CircularLoading';
import { Toast } from '../../components/utils/messages';

export default function ProfileRemarksInbox() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const inbox = useSelector((state) => state.wordSetRemarks.inbox);
  const [statusFilter, setStatusFilter] = useState('queued');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    dispatch(fetchMyWordSetRemarks({ status: statusFilter, page: 1, limit: 50 }));
  }, [dispatch, statusFilter]);

  const onMarkDone = async (id) => {
    try {
      await dispatch(updateWordSetRemark({ id, status: 'done' })).unwrap();
      setToast({ open: true, message: t('setRemark.markedDone'), severity: 'success' });
    } catch (error) {
      setToast({
        open: true,
        message: error?.message?.message || error?.message || t('setRemark.updateError'),
        severity: 'error',
      });
    }
  };

  return (
    <Box className="profile-remarks-inbox">
      <Typography className="profile-section-intro" color="text.secondary">
        {t('setRemark.inboxIntro')}
      </Typography>

      <TextField
        select
        size="small"
        label={t('admin.status')}
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        className="profile-remarks-inbox__filter"
      >
        <MenuItem value="queued">{t('feedback.statusQueued')}</MenuItem>
        <MenuItem value="done">{t('feedback.statusDone')}</MenuItem>
        <MenuItem value="all">{t('feedback.statusAll')}</MenuItem>
      </TextField>

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
                    {item.status !== 'done' && (
                      <Button size="small" variant="contained" onClick={() => onMarkDone(item.id)}>
                        {t('setRemark.markDone')}
                      </Button>
                    )}
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
