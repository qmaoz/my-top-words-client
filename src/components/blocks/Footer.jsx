import { Link } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <Paper className="site-footer">
      <footer>
        <Box className="container footer__inner">
          <span className="copyrating">Serhii © {new Date().getFullYear()} My Top Words</span>
          <Box className="footer__links">
            <Link to="/about">{t('layout.about')}</Link>
            <span className="footer__sep">·</span>
            <Link to="/terms">{t('layout.terms')}</Link>
          </Box>
        </Box>
      </footer>
    </Paper>
  );
}
