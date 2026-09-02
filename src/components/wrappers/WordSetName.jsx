import { Link } from 'react-router-dom';

export default function WordSetName({ name, link }) {
  const nameTextContent = link
    ? <Link to={link}>{name}</Link>
    : name;

  return (
    <h2 className="word-set-title" aria-label={name}>
      {nameTextContent}
    </h2>
  );
}
