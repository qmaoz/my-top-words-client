import { IconButton } from '@mui/material';
import { VolumeUp } from '@mui/icons-material';
import { speakText } from '../utils/functions';

export default function PronounceButton({ text }) {
  return (
    <>
      <IconButton className='pronounce-btn' onClick={() => speakText(text)} title="Прослухати" aria-label="Прослухати вимову">
        <VolumeUp />
      </IconButton>
    </>
  );
}
