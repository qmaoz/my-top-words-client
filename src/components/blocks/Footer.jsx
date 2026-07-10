import { Link } from 'react-router-dom';
import { Box, Paper } from '@mui/material';

export default function Footer() {
  return (
    <Paper className="site-footer">
      <footer>
        <Box className="container footer__inner">
          <span className="copyrating">Serhii © {new Date().getFullYear()} My Top Words</span>
          <Box className="footer__links">
            <Link to="/about">Про сервіс</Link>
            <span className="footer__sep">·</span>
            <Link to="/terms">Умови користування</Link>
          </Box>
        </Box>
      </footer>
    </Paper>
  );
}
