import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';

import Reveal from './Reveal';

const STEPS = [
  { num: '1', titleKey: 'about.step1Title', textKey: 'about.step1Text' },
  { num: '2', titleKey: 'about.step2Title', textKey: 'about.step2Text' },
  { num: '3', titleKey: 'about.step3Title', textKey: 'about.step3Text' },
];

export default function HomeAbout() {
  const { t } = useTranslation();

  return (
    <>
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
              <Button
                component="a"
                href="#home-sets"
                variant="contained"
                className="about-hero__btn about-hero__btn--primary"
              >
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
        <section className="about-howto content-block">
          <Typography variant="h5" component="h2" className="about-block__title">
            {t('about.howTo')}
          </Typography>

          <Box className="about-steps">
            {STEPS.map(({ num, titleKey, textKey }, index) => (
              <Reveal key={num} delay={140 + index * 70} className="about-step">
                <span className="about-step__num" aria-hidden="true">{num}</span>
                <Typography variant="h6" component="h3" className="about-step__title">
                  {t(titleKey)}
                </Typography>
                <Typography className="about-step__text">{t(textKey)}</Typography>
              </Reveal>
            ))}
          </Box>
        </section>
      </Reveal>
    </>
  );
}
