import { IconButton } from '@mui/material';
import { VolumeUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { speakText } from '../utils/functions';
import { DEFAULT_SOURCE_LOCALE } from '../utils/locales';

export default function PronounceButton({ text, locale = DEFAULT_SOURCE_LOCALE }) {
  const { t } = useTranslation();

  return (
    <>
      <IconButton
        className='pronounce-btn'
        onClick={() => speakText(text, locale)}
        title={t('word.pronounce')}
        aria-label={t('word.pronounceAria')}
      >
        <VolumeUp />
      </IconButton>
    </>
  );
}
