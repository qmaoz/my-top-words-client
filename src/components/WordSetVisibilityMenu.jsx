import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';

import { getWordSetVisibility, getWordSetVisibilityOptions } from './utils/wordSetVisibility';

const ICONS = {
  private: LockIcon,
  unlisted: LinkIcon,
  public: PublicIcon,
};

export default function WordSetVisibilityMenu({ visibility, onChange }) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const visibilityOptions = getWordSetVisibilityOptions();
  const current = visibilityOptions[getWordSetVisibility({ visibility })] || visibilityOptions.private;
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
      <Tooltip title={t('wordSet.visibilityTooltip', { label: current.label, hint: current.hint })}>
        <IconButton
          onClick={handleOpen}
          aria-label={t('wordSet.visibilityAria', { label: current.label })}
          color={current.value === 'private' ? 'error' : 'success'}
        >
          <CurrentIcon className="mui-btn" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} className="word-set-visibility-menu">
        {Object.values(visibilityOptions).map((item) => {
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
