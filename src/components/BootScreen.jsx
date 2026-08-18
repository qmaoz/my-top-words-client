import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import axios from '../axios';

const BOOT_SCREEN_ID = 'boot-screen';

function hideBootScreen() {
  const screen = document.getElementById(BOOT_SCREEN_ID);
  if (!screen || screen.dataset.hidden === 'true') {
    return;
  }

  screen.dataset.hidden = 'true';
  screen.classList.add('boot-screen--hidden');
  window.setTimeout(() => screen.remove(), 400);
}

export default function BootScreen() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const text = document.getElementById('boot-screen-text');
    if (text) {
      text.textContent = t('common.firstLoadHint');
    }
  }, [t, i18n.language]);

  useEffect(() => {
    let cancelled = false;

    const wakeApi = async () => {
      try {
        await axios.get('/health', { timeout: 90000 });
      } catch {
        // Overlay still hides: the API may be down, but the UI should remain usable.
      }

      if (!cancelled) {
        hideBootScreen();
      }
    };

    wakeApi();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
