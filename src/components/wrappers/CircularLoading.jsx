import { CircularProgress } from '@mui/material';

export default function CircularLoading({ isLoading, ...props }) {
  // option #1: do not show content inside of <CircularLoading>...</CircularLoading>
  if (props.children) {
    return (
      <>
        {isLoading ? (<>
          <CircularProgress
            size={100}
            style={{ display: 'block', margin: '0 auto' }} />
        </>) : <>
          {props.children}
        </>}
      </>
    );
  // option #2: show  only circle
  } else return (
    <>
      {isLoading && <>
        <CircularProgress
          size={100}
          style={{ display: 'block', margin: '0 auto' }} />
      </>}
    </>
  );
}