import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Paper, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import axios from '../axios';
import { formatLocaleCount } from '../components/utils/functions';

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`about-reveal ${visible ? 'about-reveal--visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const STAT_ITEMS = [
  { key: 'wordsCount', i18nKey: 'about.words' },
  { key: 'usersCount', i18nKey: 'about.users' },
  { key: 'wordSetsCount', i18nKey: 'about.sets' },
];

const FEATURES = [
  { icon: MenuBookIcon, titleKey: 'about.feature1Title', textKey: 'about.feature1Text' },
  { icon: FitnessCenterIcon, titleKey: 'about.feature2Title', textKey: 'about.feature2Text' },
  { icon: FavoriteBorderIcon, titleKey: 'about.feature3Title', textKey: 'about.feature3Text' },
  { icon: RecordVoiceOverIcon, titleKey: 'about.feature4Title', textKey: 'about.feature4Text' },
];

const STEPS = [
  { num: '1', titleKey: 'about.step1Title', textKey: 'about.step1Text' },
  { num: '2', titleKey: 'about.step2Title', textKey: 'about.step2Text' },
  { num: '3', titleKey: 'about.step3Title', textKey: 'about.step3Text' },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get('/stats');
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setStats(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box className="about-page container">
      <section className="about-hero content-block">
        <Box className="about-hero__inner">
          <Typography variant="h4" component="h1" className="about-hero__title">
            {t('about.title')}
          </Typography>
          <Typography className="about-hero__lead">
            {t('about.intro')}
          </Typography>
          <Box className="about-hero__actions">
            <Button component={Link} to="/sign-up" variant="contained" className="about-hero__btn about-hero__btn--primary">
              {t('about.signUp')}
            </Button>
            <Button component={Link} to="/" variant="outlined" className="about-hero__btn about-hero__btn--outline">
              {t('about.viewSets')}
            </Button>
          </Box>
        </Box>
      </section>

      <section className="about-block">
        <Box className="about-stats__grid">
          {STAT_ITEMS.map(({ key, i18nKey }, index) => {
            const count = stats?.[key];
            const label = t(i18nKey, { count: count ?? 0 });

            return (
            <Reveal key={key} delay={index * 60}>
              <Paper elevation={1} className="about-stat content-block">
                <Typography className="about-stat__value">{formatLocaleCount(count)}</Typography>
                <Typography className="about-stat__label">{label}</Typography>
              </Paper>
            </Reveal>
            );
          })}
        </Box>
      </section>

      <section className="about-block">
        <Reveal>
          <Typography variant="h5" component="h2" className="about-block__title">
            {t('about.features')}
          </Typography>
          <Typography className="about-block__intro">
            {t('about.featuresLead')}
          </Typography>
        </Reveal>

        <Box className="about-features">
          {FEATURES.map(({ icon: Icon, titleKey, textKey }, index) => (
            <Reveal key={titleKey} delay={index * 60}>
              <Paper elevation={1} className="about-feature content-block">
                <Box className="about-feature__icon-wrap">
                  <Icon className="about-feature__icon" />
                </Box>
                <Typography variant="h6" component="h3" className="about-feature__title">
                  {t(titleKey)}
                </Typography>
                <Typography className="about-feature__text">{t(textKey)}</Typography>
              </Paper>
            </Reveal>
          ))}
        </Box>
      </section>

      <section className="about-block about-block--muted">
        <Reveal>
          <Typography variant="h5" component="h2" className="about-block__title">
            {t('about.howTo')}
          </Typography>
        </Reveal>

        <Box className="about-steps">
          {STEPS.map(({ num, titleKey, textKey }, index) => (
            <Reveal key={num} delay={index * 70}>
              <Box className="about-step">
                <Typography className="about-step__num">{num}</Typography>
                <Typography variant="h6" component="h3" className="about-step__title">{t(titleKey)}</Typography>
                <Typography className="about-step__text">{t(textKey)}</Typography>
              </Box>
            </Reveal>
          ))}
        </Box>
      </section>

      <section className="about-block">
        <Reveal>
          <Paper elevation={1} className="about-highlight content-block">
            <TrendingUpIcon className="about-highlight__icon" />
            <Box>
              <Typography variant="h6" component="h3">{t('about.repetition')}</Typography>
              <Typography className="about-highlight__text">
                {t('about.repetitionText')}
              </Typography>
            </Box>
          </Paper>
        </Reveal>

        <Reveal delay={80}>
          <Paper elevation={1} className="about-highlight content-block">
            <GroupsIcon className="about-highlight__icon about-highlight__icon--teal" />
            <Box>
              <Typography variant="h6" component="h3">{t('about.publicSets')}</Typography>
              <Typography className="about-highlight__text">
                {t('about.publicSetsText')}
              </Typography>
            </Box>
          </Paper>
        </Reveal>
      </section>

      <section className="about-block about-feedback">
        <Reveal>
          <Typography variant="h5" component="h2" className="about-block__title">
            {t('about.feedback')}
          </Typography>
          <Typography className="about-feedback__intro">
            {t('about.feedbackTextFab')}
          </Typography>
        </Reveal>
      </section>
    </Box>
  );
}
