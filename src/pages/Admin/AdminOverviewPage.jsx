import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Paper, Typography } from '@mui/material';

import { fetchAdminOverview } from '../../redux/slices/admin';
import { formatLocaleCount, nounCase } from '../../components/utils/functions';
import CircularLoading from '../../components/wrappers/CircularLoading';

function StatCard({ value, one, few, many, suffix, to }) {
  const label = `${nounCase(value, one, few, many)}${suffix ? ` ${suffix}` : ''}`;
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
  const dispatch = useDispatch();
  const { overview, overviewStatus } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminOverview());
  }, [dispatch]);

  return (
    <CircularLoading isLoading={overviewStatus === 'loading'}>
      <Box className="admin-overview">
        <Typography className="admin-section__intro">
          Короткий огляд стану сервісу.
        </Typography>

        <Box className="admin-stat-grid">
          <StatCard
            value={overview?.usersCount}
            one="користувач"
            few="користувачі"
            many="користувачів"
            to="/admin/users"
          />
          <StatCard
            value={overview?.wordsCount}
            one="слово"
            few="слова"
            many="слів"
            suffix="у базі"
          />
          <StatCard
            value={overview?.wordSetsCount}
            one="набір"
            few="набори"
            many="наборів"
            suffix="слів"
          />
        </Box>

        <Typography variant="h6" component="h3" className="admin-block__title">
          Зворотний зв&apos;язок
        </Typography>

        <Box className="admin-stat-grid admin-stat-grid--compact">
          <StatCard
            value={overview?.feedbackQueued}
            one="повідомлення"
            few="повідомлення"
            many="повідомлень"
            suffix="у черзі"
            to="/admin/feedback"
          />
          <StatCard
            value={overview?.feedbackInProgress}
            one="повідомлення"
            few="повідомлення"
            many="повідомлень"
            suffix="на розгляді"
            to="/admin/feedback"
          />
          <StatCard
            value={overview?.feedbackDone}
            one="повідомлення"
            few="повідомлення"
            many="повідомлень"
            suffix="виконано"
            to="/admin/feedback"
          />
        </Box>
      </Box>
    </CircularLoading>
  );
}
