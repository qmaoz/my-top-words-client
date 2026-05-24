import { Link } from 'react-router';
import circleInfo from '/img/icons/circle-info.svg';
import circleExclamationIcon from '/img/icons/circle-exclamation.svg';
import { Paper } from '@mui/material';

export default function Footer() {
  return (
    <>
      <Paper className='mt-3'>
        <footer>
          <div className="container df">
            <span className="copyrating">Serhii © {new Date().getFullYear()} My Top Words</span>
            <div className="footer__right df">
              <div className="footer__about">
                <img src={circleInfo} className='footer__icon' alt="info logo" />
                <Link to="/about">Про сайт</Link>
              </div>
              <div className="footer__terms-of-service">
                <img src={circleExclamationIcon} className='footer__icon' alt="info logo" />
                <Link to="/terms">Умови використання</Link>
              </div>
            </div>
          </div>
        </footer>
      </Paper>
    </>
  );
}
