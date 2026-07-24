import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton } from '@mui/material';

import { formatWordSetAsBulkText } from './utils/parseBulkWords';
import { DEFAULT_TRANSLATION_LOCALES } from './utils/locales';

export default function CopyWordSetContentButton({ words, translationLocales = DEFAULT_TRANSLATION_LOCALES, onNotify }) {
  const { t } = useTranslation();

  if (!words?.length) {
    return null;
  }

  const handleCopy = async () => {
    const text = formatWordSetAsBulkText(words, translationLocales);

    try {
      await navigator.clipboard.writeText(text);
      onNotify?.({
        message: t('bulkImport.copied', { count: words.length }),
        severity: 'success',
      });
    } catch {
      onNotify?.({
        message: t('bulkImport.copyError'),
        severity: 'error',
      });
    }
  };

  return (
    <IconButton
      onClick={handleCopy}
      title={t('bulkImport.copyTooltip')}
      aria-label={t('bulkImport.copyAria')}
      color="primary"
    >
      <ContentCopyIcon className="mui-btn" />
    </IconButton>
  );
}
