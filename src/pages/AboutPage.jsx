import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';

import Reveal from '../components/Reveal';

const STEPS = [
  { num: '1', titleKey: 'about.step1Title', textKey: 'about.step1Text' },
  { num: '2', titleKey: 'about.step2Title', textKey: 'about.step2Text' },
  { num: '3', titleKey: 'about.step3Title', textKey: 'about.step3Text' },
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <Box className="about-page container">
      <Reveal>
        <section className="about-hero content-block">
          <Box className="about-hero__inner">
            <Typography variant="h4" component="h1" className="about-hero__title">
              {t('about.title')}
            </Typography>
            <Typography className="about-hero__lead">
              {t('about.intro')}
            </Typography>
            <Box className="about-hero__actions">
              <Button component={Link} to="/" variant="contained" className="about-hero__btn about-hero__btn--primary">
                {t('about.viewSets')}
              </Button>
              <Button component={Link} to="/sign-up" variant="outlined" className="about-hero__btn about-hero__btn--outline">
                {t('about.signUp')}
              </Button>
            </Box>
          </Box>
        </section>
      </Reveal>

      <Reveal delay={80}>
        <section className="about-block about-block--muted">
          <Typography variant="h5" component="h2" className="about-block__title">
            {t('about.howTo')}
          </Typography>

          <Box className="about-steps">
            {STEPS.map(({ num, titleKey, textKey }, index) => (
              <Reveal key={num} delay={140 + index * 70} className="about-step">
                <Typography className="about-step__num" aria-hidden="true">{num}</Typography>
                <Typography variant="h6" component="h3" className="about-step__title">
                  {t(titleKey)}
                </Typography>
                <Typography className="about-step__text">{t(textKey)}</Typography>
              </Reveal>
            ))}
          </Box>
        </section>
      </Reveal>

      <Reveal delay={120}>
        <section className="about-block about-feedback">
          <Typography variant="h5" component="h2" className="about-block__title">
            {t('about.feedback')}
          </Typography>
          <Typography className="about-feedback__intro">
            {t('about.feedbackTextFab')}
          </Typography>
        </section>
      </Reveal>
    </Box>
  );
}
