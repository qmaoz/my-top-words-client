import { Link } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';

export default function TermsAndConditionsPage() {
  return (
    <Box className="terms-page container">
      <Box className="terms-page__header">
        <Typography variant="h4" component="h1">
          Умови користування
        </Typography>
        <Typography className="terms-page__intro">
          Коротко про те, як влаштований сервіс і що варто знати перед реєстрацією.
        </Typography>
      </Box>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          Навіщо цей сервіс
        </Typography>
        <Typography className="terms-section__text" component="p">
          My Top Words — інструмент для вивчення німецької лексики: набори слів, тренажер, збереження прогресу.
          Користування сайтом означає, що Вам підходить такий формат навчання.
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          Які дані зберігаються
        </Typography>
        <Typography className="terms-section__text" component="p">
          Для роботи акаунта потрібні лише базові речі: ім&apos;я користувача, захищений пароль (у базі зберігається
          не сам пароль, а його криптографічний хеш), Ваші набори слів і відмітки про вивчені позиції.
        </Typography>
        <Typography className="terms-section__text" component="p">
          Якщо Ви надсилаєте зворотний зв&apos;язок, зберігається текст повідомлення, його тип і, за бажанням,
          адреса сторінки, де Ви помітили проблему.
        </Typography>
        <Typography className="terms-section__text" component="p">
          Ми не продаємо ці дані третім особам і не використовуємо їх для реклами.
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          Ваш обліковий запис
        </Typography>
        <Typography className="terms-section__text" component="p">
          Пароль — Ваша особиста відповідальність. Обирайте надійний пароль і не передавайте його іншим людям.
          При реєстрації сайт підкаже вимоги до складності — це допомагає захистити акаунт.
        </Typography>
        <Typography className="terms-section__text" component="p">
          Усі дії, виконані під Вашим іменем після входу, вважаються Вашими. Якщо пароль став відомий комусь сторонньому,
          краще змінити його або звернутися через форму зворотного зв&apos;язку.
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          Навчальні матеріали
        </Typography>
        <Typography className="terms-section__text" component="p">
          Переклади та приклади речень мають навчальний характер. Можливі неточності — для роботи, навчання та повсякденного
          спілкування матеріал зручний, для офіційних текстів варто звірятися з іншими джерелами.
        </Typography>
        <Typography className="terms-section__text" component="p">
          Публічні набори створюють їхні автори. Зберігаючи чужий набір, Ви користуєтесь ним у межах можливостей сервісу.
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          Код проєкту
        </Typography>
        <Typography className="terms-section__text" component="p">
          Клієнтська частина проєкту поширюється на умовах{' '}
          <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer">
            CC0 1.0
          </a>
          . Текст ліцензії є у файлі LICENSE репозиторію.
        </Typography>
      </Paper>

      <Paper elevation={1} className="terms-section content-block">
        <Typography variant="h6" component="h2" className="terms-section__title">
          Зміни та питання
        </Typography>
        <Typography className="terms-section__text" component="p">
          Функції сайту можуть поступово змінюватися. Актуальна версія цього тексту завжди тут, на цій сторінці.
        </Typography>
        <Typography className="terms-section__text" component="p">
          З питань, пропозицій або помилок —{' '}
          <Link to="/about">форма зворотного зв&apos;язку</Link> на сторінці «Про сервіс».
        </Typography>
      </Paper>

      <Typography className="terms-page__footer-note">
        Докладніше про можливості сервісу — на сторінці <Link to="/about">Про сервіс</Link>.
      </Typography>
    </Box>
  );
}
