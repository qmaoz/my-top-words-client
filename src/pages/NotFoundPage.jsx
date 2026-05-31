import { WarningMessage } from '../components/utils/messages';
import { Box } from '@mui/material';

export default function NotFoundPage() {
  return (
    <>
      <Box className="container">
        <h2>Сторінку не знайдено</h2>
        <WarningMessage message={'Можливо, Ви помилилися в адресі, або сторінки вже не існує.'} />
      </Box>
    </>
  );
}