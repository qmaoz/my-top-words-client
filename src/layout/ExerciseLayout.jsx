import { Outlet } from 'react-router';
import GlobalFeedbackButton from '../components/GlobalFeedbackButton';

export default function ExerciseLayout() {
  return (
    <>
      <Outlet />
      <GlobalFeedbackButton />
    </>
  );
}
