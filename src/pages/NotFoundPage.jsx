import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WarningMessage } from '../components/utils/messages';
import { Box } from '@mui/material';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <Box className="container not-found-page">
        <h2>{t('common.notFoundTitle')}</h2>
        <WarningMessage message={t('common.notFoundText')} />
        <p className="m-0"><Link to="/">{t('common.goHome')}</Link></p>
      </Box>
    </>
  );
}