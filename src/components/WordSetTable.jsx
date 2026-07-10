import { Box } from '@mui/material';
import WordTableRow from './WordTableRow';

export default function WordSetTable({ words, isAuthorized, className, isEditing, showLearnedToggle, onToggleLearned, onUpdate, onFullDelete }) {
  return (
    <Box className={className ?? ''}>
      <Box className="word-set-table-wrap">
      <table className="word-set-table">
        {words?.map((word) => (
          <WordTableRow
            key={word.id}
            word={word}
            isAuthorized={isAuthorized}
            isEditing={isEditing}
            showLearnedToggle={showLearnedToggle}
            onToggleLearned={onToggleLearned}
            onUpdate={onUpdate}
            onFullDelete={onFullDelete}
          />
        ))}
      </table>
      </Box>
    </Box>
  );
}