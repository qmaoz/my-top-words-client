import { Outlet } from 'react-router';
import GlobalFeedbackButton from '../GlobalFeedbackButton';

export default function ExerciseLayout() {
  return (
    <>
      <Outlet />
      <GlobalFeedbackButton />
    </>
  );
}
