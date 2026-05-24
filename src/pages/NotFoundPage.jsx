import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <>
      <div className="container">
        <h2>Сторінку не знайдено</h2>
        <p>Можливо, Ви помилилися в адресі, або сторінки вже не існує.</p>
      </div>
    </>
  );
}