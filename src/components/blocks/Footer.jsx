import { Link } from 'react-router';
import circleInfo from '/img/icons/circle-info.svg';
import circleExclamationIcon from '/img/icons/circle-exclamation.svg';
import { Box, Paper } from '@mui/material';

export default function Footer() {
  return (
    <>
      <Paper className='mt-3'>
        <footer>
          <Box className="container text-center">
            <span className="copyrating">Serhii © {new Date().getFullYear()} My Top Words</span>
            {/* <Box className="footer__right df">
              <Box className="footer__about">
                <img src={circleInfo} className='footer__icon' alt="info logo" />
                <Link to="/about">Про сайт</Link>
              </Box>
              <Box className="footer__terms-of-service">
                <img src={circleExclamationIcon} className='footer__icon' alt="info logo" />
                <Link to="/terms">Умови використання</Link>
              </Box>
            </Box> */}
          </Box>
        </footer>
      </Paper>
    </>
  );
}
