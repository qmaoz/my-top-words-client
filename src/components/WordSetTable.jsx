import WordTableRow from './WordTableRow';

export default function WordSetTable({ words, isProfilePage, isAuthorized, className, isEditing, onUpdate, onRemoveFromSet, onFullDelete }) {
  return (
    <div className={'table-limit ' + className}>
      <table className="word-set-table">
        {words?.map((word) => (
          <WordTableRow
            key={word.id}
            word={word}
            isAuthorized={isAuthorized}
            // isSavedForLearning={isSavedForLearning}
            isProfilePage={isProfilePage}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onRemoveFromSet={onRemoveFromSet}
            onFullDelete={onFullDelete}
            // handleToggleSave={handleToggleSave}
          />
        ))}
      </table>
    </div>
  );
}