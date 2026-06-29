import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { stopSpeech } from './functions';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    stopSpeech();
  }, [pathname]);

  return null;
}