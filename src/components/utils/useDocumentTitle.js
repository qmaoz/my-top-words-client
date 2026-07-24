import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { setDocumentTitle } from './DocumentTitle';

export function useDocumentTitle(pageLabel) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (pageLabel) {
      setDocumentTitle(pageLabel, t);
    }
  }, [pageLabel, t, i18n.language]);
}
