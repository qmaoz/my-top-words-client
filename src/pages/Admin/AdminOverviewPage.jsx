import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography } from '@mui/material';

import { fetchAdminOverview } from '../../redux/slices/admin';
import { formatLocaleCount } from '../../components/utils/functions';
import CircularLoading from '../../components/wrappers/CircularLoading';

function StatCard({ value, i18nKey, suffixKey, to }) {
  const { t } = useTranslation();
  const label = suffixKey
    ? `${t(i18nKey, { count: value ?? 0 })} ${t(suffixKey)}`
    : t(i18nKey, { count: value ?? 0 });
  const content = (
    <Paper elevation={1} className="admin-stat content-block">
      <Typography className="admin-stat__value">{formatLocaleCount(value)}</Typography>
      <Typography className="admin-stat__label">{label}</Typography>
    </Paper>
  );

  if (to) {
    return <Link to={to} className="admin-stat-link">{content}</Link>;
  }

  return content;
}

export default function AdminOverviewPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { overview, overviewStatus } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminOverview());
  }, [dispatch]);

  return (
    <CircularLoading isLoading={overviewStatus === 'loading'}>
      <Box className="admin-overview">
        <Typography className="admin-section__intro">
          {t('admin.overviewDesc')}
        </Typography>

        <Box className="admin-stat-grid">
          <StatCard
            value={overview?.usersCount}
            i18nKey="admin.user"
            to="/admin/users"
          />
          <StatCard
            value={overview?.wordsCount}
            i18nKey="about.words"
          />
          <StatCard
            value={overview?.wordSetsCount}
            i18nKey="admin.set"
            suffixKey="admin.statSetsSuffix"
          />
        </Box>

        <Typography variant="h6" component="h3" className="admin-block__title">
          {t('admin.feedback')}
        </Typography>

        <Box className="admin-stat-grid admin-stat-grid--compact">
          <StatCard
            value={overview?.feedbackQueued}
            i18nKey="admin.message"
            suffixKey="admin.msgQueued"
            to="/admin/feedback"
          />
          <StatCard
            value={overview?.feedbackInProgress}
            i18nKey="admin.message"
            suffixKey="admin.msgInProgress"
            to="/admin/feedback"
          />
          <StatCard
            value={overview?.feedbackDone}
            i18nKey="admin.message"
            suffixKey="admin.msgDone"
            to="/admin/feedback"
          />
        </Box>
      </Box>
    </CircularLoading>
  );
}
