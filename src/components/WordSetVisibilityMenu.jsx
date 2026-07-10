import { useState } from 'react';
import {
  IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';

import { getWordSetVisibility, WORD_SET_VISIBILITY } from './utils/wordSetVisibility';

const ICONS = {
  private: LockIcon,
  unlisted: LinkIcon,
  public: PublicIcon,
};

export default function WordSetVisibilityMenu({ visibility, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const current = WORD_SET_VISIBILITY[getWordSetVisibility({ visibility })] || WORD_SET_VISIBILITY.private;
  const CurrentIcon = ICONS[current.value];

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (nextValue) => {
    handleClose();
    if (nextValue !== current.value) {
      onChange(nextValue);
    }
  };

  return (
    <>
      <Tooltip title={`${current.label}. ${current.hint}`}>
        <IconButton
          onClick={handleOpen}
          aria-label={`Доступ до набору: ${current.label}`}
          color={current.value === 'private' ? 'error' : 'success'}
        >
          <CurrentIcon className="mui-btn" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} className="word-set-visibility-menu">
        {Object.values(WORD_SET_VISIBILITY).map((item) => {
          const Icon = ICONS[item.value];
          return (
            <MenuItem
              key={item.value}
              selected={item.value === current.value}
              onClick={() => handleSelect(item.value)}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.hint} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
