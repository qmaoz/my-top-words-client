import { Box } from '@mui/material';
import WordTableRow from './WordTableRow';

export default function WordSetTable({ words, isAuthorized, className, isEditing, onUpdate, onFullDelete }) {
  return (
    <Box className={'table-limit ' + (className ?? '')}>
      <table className="word-set-table">
        {words?.map((word) => (
          <WordTableRow
            key={word.id}
            word={word}
            isAuthorized={isAuthorized}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onFullDelete={onFullDelete}
          />
        ))}
      </table>
    </Box>
  );
}