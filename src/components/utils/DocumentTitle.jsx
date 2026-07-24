import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function resolvePageLabel(pathname, t) {
  if (pathname === '/' || pathname === '/home' || pathname === '/main') {
    return null;
  }

  if (pathname === '/login') return t('auth.loginTitle');
  if (pathname === '/sign-up') return t('auth.registerTitle');
  if (pathname === '/about') return t('about.title');
  if (pathname === '/terms') return t('terms.title');

  if (pathname === '/profile' || pathname === '/profile/saved-word-sets') return t('profile.tabSaved');
  if (pathname === '/profile/own-word-sets') return t('profile.tabOwn');
  if (pathname === '/profile/settings') return t('profile.tabSettings');

  if (pathname.startsWith('/word-set/')) return t('wordSet.pageTitle');
  if (pathname.startsWith('/translate-exercise/')) return t('exercise.pageTitle');

  if (pathname === '/admin' || pathname === '/admin/overview') return t('admin.title');
  if (pathname === '/admin/feedback') return t('admin.tabFeedback');
  if (pathname === '/admin/users') return t('admin.tabUsers');

  return t('common.notFoundTitle');
}

export function setDocumentTitle(pageLabel, t) {
  document.title = pageLabel
    ? t('layout.pageTitle', { page: pageLabel })
    : t('layout.documentTitle');
}

export default function DocumentTitle() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const pageLabel = resolvePageLabel(pathname, t);
    setDocumentTitle(pageLabel, t);
  }, [pathname, t, i18n.language]);

  return null;
}
