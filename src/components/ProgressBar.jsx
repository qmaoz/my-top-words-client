import { Box } from '@mui/material';

export default function ProgressBar({ completed, total }) {
  const procent = completed == 0 ? 0 : Math.round((completed / total * 100));
  
  const borderRightWidth = procent === 100 || !procent ? '0px' : '2px';

  return (
    <>
      <Box className="my-progress-bar" sx={{ boxShadow: 2 }}>
        <Box className="my-progress-bar__filled" style={{ width: `${procent}%`, borderRightWidth: borderRightWidth }}></Box>
        <span className="my-progress-bar__percent text-nowrap">{completed} / {total}</span>
      </Box>
    </>
  );
}