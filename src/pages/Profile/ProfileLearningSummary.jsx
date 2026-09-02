import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';

import axios from '../../axios';
import InfoHint from '../../components/InfoHint';
import { WarningMessage } from '../../components/utils/messages';

function formatNextReview(nextReviewAt, t, locale) {
  if (!nextReviewAt) return t('learning.nextReviewNone');

  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(nextReviewAt));
  } catch {
    return t('learning.nextReviewNone');
  }
}

export default function ProfileLearningSummary() {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get('/me/learning-summary');
        if (!cancelled) {
          setSummary(data);
          setLoadError(false);
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
          setLoadError(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const when = useMemo(
    () => formatNextReview(summary?.nextReviewAt, t, i18n.language),
    [summary, t, i18n.language],
  );

  if (loadError) {
    return (
      <div className="profile-learning-summary">
        <WarningMessage message={t('learning.loadError')} />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="profile-learning-summary">
      <Box className="profile-learning-summary__item heading-with-info">
        <Typography component="p" className="profile-learning-summary__value">
          {t('learning.dueToday', { count: summary.dueToday || 0 })}
        </Typography>
        <InfoHint title={t('learning.dueTodayHint')} />
      </Box>
      <Box className="profile-learning-summary__item heading-with-info">
        <Typography component="p" className="profile-learning-summary__value">
          {t('learning.streak', { count: summary.streak || 0 })}
        </Typography>
        <InfoHint title={t('learning.streakHint')} />
      </Box>
      <Box className="profile-learning-summary__item heading-with-info">
        <Typography component="p" className="profile-learning-summary__value">
          {t('learning.nextReview', { when })}
        </Typography>
        <InfoHint title={t('learning.nextReviewHint')} />
      </Box>
    </div>
  );
}
