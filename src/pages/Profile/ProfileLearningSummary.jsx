import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import axios from '../../axios';

function formatNextReview(nextReviewAt, dueToday, t, locale) {
  if (dueToday > 0) return t('learning.nextReviewNow');
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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get('/me/learning-summary');
        if (!cancelled) setSummary(data);
      } catch {
        if (!cancelled) setSummary(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const when = useMemo(
    () => formatNextReview(summary?.nextReviewAt, summary?.dueToday || 0, t, i18n.language),
    [summary, t, i18n.language],
  );

  if (!summary) return null;

  return (
    <div className="profile-learning-summary">
      <Typography component="p" className="profile-learning-summary__item">
        {t('learning.dueToday', { count: summary.dueToday || 0 })}
      </Typography>
      <Typography component="p" className="profile-learning-summary__item">
        {t('learning.streak', { count: summary.streak || 0 })}
      </Typography>
      <Typography component="p" className="profile-learning-summary__item">
        {t('learning.nextReview', { when })}
      </Typography>
    </div>
  );
}
