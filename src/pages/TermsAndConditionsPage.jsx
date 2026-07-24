import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography } from '@mui/material';

export default function TermsAndConditionsPage() {
  const { t } = useTranslation();

  return (
    <Box className="terms-page container">
      <Box className="terms-page__header">
        <Typography variant="h4" component="h1">
          {t('terms.title')}
        </Typography>
        <Typography className="terms-page__intro">
          {t('terms.subtitle')}
        </Typography>
      </Box>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          {t('terms.whyTitle')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.whyText')}
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          {t('terms.dataTitle')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.dataText1')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.dataText2')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.dataText3')}
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          {t('terms.accountTitle')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.accountText1')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.accountText2')}
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          {t('terms.materialsTitle')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.materialsText1')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.materialsText2')}
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          {t('terms.codeTitle')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.codeText')}{' '}
          <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer">
            CC0 1.0
          </a>
          . {t('terms.codeLicenseNote')}
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          {t('terms.changesTitle')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.changesText')}
        </Typography>
        <Typography className="terms-section__text" component="p">
          {t('terms.contactText')}
        </Typography>
      </Paper>

      <Typography className="terms-page__footer-note">
        {t('terms.moreText')} <Link to="/about">{t('terms.moreLink')}</Link>.
      </Typography>
    </Box>
  );
}
