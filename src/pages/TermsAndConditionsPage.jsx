import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';

import Reveal from '../components/Reveal';

const SECTIONS = [
  { titleKey: 'terms.dataTitle', textKey: 'terms.dataText' },
  { titleKey: 'terms.accountTitle', textKey: 'terms.accountText' },
  { titleKey: 'terms.materialsTitle', textKey: 'terms.materialsText' },
];

export default function TermsAndConditionsPage() {
  const { t } = useTranslation();

  return (
    <Box className="terms-page container">
      <Reveal>
        <Box className="terms-page__header">
          <Typography variant="h4" component="h1">
            {t('terms.title')}
          </Typography>
          <Typography className="terms-page__intro">
            {t('terms.intro')}
          </Typography>
        </Box>
      </Reveal>

      <Reveal delay={90}>
        <Box className="terms-page__body content-block">
          {SECTIONS.map(({ titleKey, textKey }, index) => (
            <Reveal key={titleKey} delay={140 + index * 80} className="terms-section">
              <Typography variant="h6" component="h2" className="terms-section__title">
                {t(titleKey)}
              </Typography>
              <Typography className="terms-section__text" component="p">
                {t(textKey)}
              </Typography>
            </Reveal>
          ))}

          <Reveal delay={380}>
            <Typography className="terms-section__text terms-page__contact" component="p">
              {t('terms.contactText')}
            </Typography>
          </Reveal>
        </Box>
      </Reveal>
    </Box>
  );
}
