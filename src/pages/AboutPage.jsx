import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import axios from '../axios';
import FeedbackForm from '../components/FeedbackForm';
import { formatLocaleCount, nounCase } from '../components/utils/functions';

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
  { key: 'wordsCount', one: 'слово', few: 'слова', many: 'слів', suffix: 'у базі' },
  { key: 'usersCount', one: 'користувач', few: 'користувачі', many: 'користувачів' },
  { key: 'wordSetsCount', one: 'набір', few: 'набори', many: 'наборів', suffix: 'слів' },
];

const FEATURES = [
  {
    icon: MenuBookIcon,
    title: 'Речення з перекладом',
    text: 'Кожне слово супроводжується прикладом у реченні — лексика вивчається в контексті.',
  },
  {
    icon: FitnessCenterIcon,
    title: 'Тренажер',
    text: 'Вправи на переклад допомагають перевірити розуміння та закріпити матеріал.',
  },
  {
    icon: FavoriteBorderIcon,
    title: 'Набори слів',
    text: 'Можна створювати власні набори, зберігати чужі публічні набори та відмічати вивчені слова.',
  },
  {
    icon: RecordVoiceOverIcon,
    title: 'Озвучення',
    text: 'У тренажері доступне прослуховування німецького тексту.',
  },
];

const STEPS = [
  { num: '1', title: 'Обрати набір', text: 'Переглянути публічні набори або створити власний.' },
  { num: '2', title: 'Пройти тренажер', text: 'Перекласти речення та перевірити відповідь.' },
  { num: '3', title: 'Відмітити вивчене', text: 'Позначити слова, які вже засвоєні, щоб зосередитись на решті.' },
];

export default function AboutPage() {
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
            Про сервіс
          </Typography>
          <Typography className="about-hero__lead">
            My Top Words — невеликий інструмент для вивчення німецької лексики.
            Основна ідея проста: працювати зі словами у реченнях і повторювати їх у тренажері.
          </Typography>
          <Box className="about-hero__actions">
            <Button component={Link} to="/sign-up" variant="contained" className="about-hero__btn about-hero__btn--primary">
              Зареєструватися
            </Button>
            <Button component={Link} to="/" variant="outlined" className="about-hero__btn about-hero__btn--outline">
              Переглянути набори
            </Button>
          </Box>
        </Box>
      </section>

      <section className="about-block">
        <Box className="about-stats__grid">
          {STAT_ITEMS.map(({ key, one, few, many, suffix }, index) => {
            const count = stats?.[key];
            const label = `${nounCase(count, one, few, many)}${suffix ? ` ${suffix}` : ''}`;

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
            Можливості
          </Typography>
          <Typography className="about-block__intro">
            Сервіс орієнтований на регулярну роботу з лексикою, без зайвих елементів.
          </Typography>
        </Reveal>

        <Box className="about-features">
          {FEATURES.map(({ icon: Icon, title, text }, index) => (
            <Reveal key={title} delay={index * 60}>
              <Paper elevation={1} className="about-feature content-block">
                <Box className="about-feature__icon-wrap">
                  <Icon className="about-feature__icon" />
                </Box>
                <Typography variant="h6" component="h3" className="about-feature__title">
                  {title}
                </Typography>
                <Typography className="about-feature__text">{text}</Typography>
              </Paper>
            </Reveal>
          ))}
        </Box>
      </section>

      <section className="about-block about-block--muted">
        <Reveal>
          <Typography variant="h5" component="h2" className="about-block__title">
            Як користуватись
          </Typography>
        </Reveal>

        <Box className="about-steps">
          {STEPS.map(({ num, title, text }, index) => (
            <Reveal key={num} delay={index * 70}>
              <Box className="about-step">
                <Typography className="about-step__num">{num}</Typography>
                <Typography variant="h6" component="h3" className="about-step__title">{title}</Typography>
                <Typography className="about-step__text">{text}</Typography>
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
              <Typography variant="h6" component="h3">Повторення</Typography>
              <Typography className="about-highlight__text">
                У тренажері слова, які ще не позначені як вивчені, з&apos;являються знову під час сесії.
              </Typography>
            </Box>
          </Paper>
        </Reveal>

        <Reveal delay={80}>
          <Paper elevation={1} className="about-highlight content-block">
            <GroupsIcon className="about-highlight__icon about-highlight__icon--teal" />
            <Box>
              <Typography variant="h6" component="h3">Публічні набори</Typography>
              <Typography className="about-highlight__text">
                Автори можуть робити набори публічними; інші користувачі можуть їх переглядати та зберігати.
              </Typography>
            </Box>
          </Paper>
        </Reveal>
      </section>

      <section className="about-block about-feedback">
        <Reveal>
          <Typography variant="h5" component="h2" className="about-block__title">
            Зворотний зв&apos;язок
          </Typography>
          <Typography className="about-feedback__intro">
            Повідомте про помилку в тексті, технічну несправність або запропонуйте зміну.
          </Typography>
          <FeedbackForm defaultPageUrl="/about" />
        </Reveal>
      </section>
    </Box>
  );
}
