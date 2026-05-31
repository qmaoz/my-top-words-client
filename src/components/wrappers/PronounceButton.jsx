import { IconButton } from '@mui/material';
import { VolumeUp } from '@mui/icons-material';
import { speakText } from '../utils/functions';

export default function PronounceButton({ text }) {
  return (
    <>
      <IconButton size="small" onClick={() => speakText(text)}>
        <VolumeUp fontSize="small" />
      </IconButton>
    </>
  );
}