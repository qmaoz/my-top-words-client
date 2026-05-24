import { Outlet } from 'react-router';
import Footer from './Footer';
import Header from './Header';
import { Box } from '@mui/material';

export default function DefaultLayout() {
  return (
    <>
      <Box className="app-container">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </Box>
    </>
  );
}