import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export default function SaveForLearningButton({ isSavedForLearning, handleToggleSave }) {
  const label = isSavedForLearning ? 'Прибрати зі збережених' : 'Зберегти набір до профілю';

  return (
    <IconButton
      onClick={handleToggleSave}
      title={label}
      aria-label={label}
      color={isSavedForLearning ? 'error' : 'default'}
    >
      {isSavedForLearning ? <FavoriteIcon className="mui-btn" /> : <FavoriteBorderIcon className="mui-btn" />}
    </IconButton>
  );
}
