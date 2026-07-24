import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ExerciseBackButton({ wordSetId, onClick }) {
  const { t } = useTranslation();

  return (
    <IconButton
      component={Link}
      to={`/word-set/${wordSetId}`}
      onClick={onClick}
      className="exercise-page-top-back"
      title={t('exercise.backToSet')}
      aria-label={t('exercise.backToSet')}
      color="inherit"
    >
      <ArrowBackIcon />
    </IconButton>
  );
}
