import { Link } from 'react-router-dom';

export default function WordSetName({ name: fullName, maxLength, link }) {
  const isNameVeryLong = fullName?.length > maxLength;
  const wordSetName = isNameVeryLong ? fullName?.substring(0, maxLength) : fullName;
  
  const nameTextContent = link
    ? <Link to={link}>{wordSetName}{isNameVeryLong ? '...' : ''}</Link>
    : <>{wordSetName}{isNameVeryLong ? '...' : ''}</>;

  return (
    <>
      <h2 className='word-set-title' title={isNameVeryLong ? fullName : undefined} aria-label={fullName}>
        <pre>{nameTextContent}</pre>
      </h2>
    </>
  );
}