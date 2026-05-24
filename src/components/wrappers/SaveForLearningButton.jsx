import graduationCapSolidIcon from '/img/icons/graduation-cap-solid.svg';
import graduationCapOutlineIcon from '/img/icons/graduation-cap-outline.svg';

export default function SaveForLearningButton({ isSavedForLearning, handleToggleSave, big }) {
  return (
    <>
      <img
        className={'mark-for-studing ' + (big ? 'big' : '')}
        title={isSavedForLearning ? 'Відмінити позначку' : 'Позначити набір для вивчення'}
        src={isSavedForLearning ? graduationCapSolidIcon : graduationCapOutlineIcon}
        onClick={handleToggleSave}
        alt="graduation cap"></img>
    </>
  );
}