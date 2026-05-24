import { Box } from "@mui/material";

export default function ProgressBar({ numWordsLearned, totalWords }) {
  const procent = numWordsLearned == 0 ? 0 : Math.round((numWordsLearned / totalWords * 100));
  
  const borderRightStyle = procent === 100 || !procent ? '' : '2px solid var(--accent-green-dark)';

  return (
    <>
      <Box className="my-progress-bar" sx={{ boxShadow: 2 }}>
        <div className="my-progress-bar__filled" style={{ width: `${procent}%`, borderRight: borderRightStyle }}></div>
        <span className="my-progress-bar__percent text-nowrap">{numWordsLearned} / {totalWords}</span>
      </Box>
    </>
  );
}