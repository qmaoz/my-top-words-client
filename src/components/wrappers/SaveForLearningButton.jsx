import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export default function SaveForLearningButton({ isSavedForLearning, handleToggleSave, big }) {
  const label = isSavedForLearning ? 'Прибрати зі збережених' : 'Зберегти для навчання';

  return (
    <IconButton
      onClick={handleToggleSave}
      title={label}
      aria-label={label}
      color={isSavedForLearning ? 'error' : 'default'}
      className={'save-for-learning-btn ' + (big ? 'big' : '')}
    >
      {isSavedForLearning ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </IconButton>
  );
}
