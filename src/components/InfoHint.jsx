import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Tooltip } from '@mui/material';

export default function InfoHint({ title, placement = 'top', ariaLabel }) {
  if (!title) return null;

  return (
    <Tooltip title={title} arrow placement={placement}>
      <IconButton
        size="small"
        className="info-hint-btn"
        aria-label={ariaLabel || (typeof title === 'string' ? title : undefined)}
      >
        <InfoOutlinedIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}
