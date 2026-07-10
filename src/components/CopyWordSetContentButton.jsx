import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton } from '@mui/material';

import { formatWordSetAsBulkText } from './utils/parseBulkWords';
import { correctNounCase, formatLocaleCount } from './utils/functions';

const COPY_HINT = 'Скопіювати слова списком — можна вставити в інший набір';

export default function CopyWordSetContentButton({ words, onNotify }) {
  if (!words?.length) {
    return null;
  }

  const handleCopy = async () => {
    const text = formatWordSetAsBulkText(words);

    try {
      await navigator.clipboard.writeText(text);
      onNotify?.({
        message: `Скопійовано ${formatLocaleCount(words.length)} ${correctNounCase(words.length, 'слово', 'слова', 'слів')}`,
        severity: 'success',
      });
    } catch {
      onNotify?.({
        message: 'Не вдалося скопіювати. Спробуйте ще раз або скопіюйте вручну',
        severity: 'error',
      });
    }
  };

  return (
    <IconButton
      onClick={handleCopy}
      title={COPY_HINT}
      aria-label="Скопіювати слова набору"
      color="primary"
    >
      <ContentCopyIcon className="mui-btn" />
    </IconButton>
  );
}
