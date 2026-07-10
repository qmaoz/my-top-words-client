import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IconButton, Checkbox, Tooltip, Box } from '@mui/material';
import { Edit, Delete, Save, Close } from '@mui/icons-material';
import PronounceButton from './wrappers/PronounceButton';

function getWordFormValues(word) {
  return {
    word_text: word.word_text,
    word_translation_uk: word.word_translation_uk,
    sentence_text: word.sentence_text,
    sentence_translation_uk: word.sentence_translation_uk,
  };
}

const WordTableRow = ({
  word,
  isAuthorized,
  isEditing,
  showLearnedToggle,
  onToggleLearned,
  onUpdate,
  onFullDelete,
}) => {
  const [isLocalEdit, setIsLocalEdit] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: getWordFormValues(word),
  });

  useEffect(() => {
    if (!isEditing) {
      setIsLocalEdit(false);
      reset(getWordFormValues(word));
    }
  }, [isEditing, word, reset]);

  const showInputs = isEditing && isLocalEdit;

  const onSubmit = async (data) => {
    const shouldClose = await onUpdate(word.id, data);
    if (shouldClose !== false) {
      setIsLocalEdit(false);
    }
  };

  const handleCancel = () => {
    reset(getWordFormValues(word));
    setIsLocalEdit(false);
  };

  const startLocalEdit = () => {
    reset(getWordFormValues(word));
    setIsLocalEdit(true);
  };

  return (
    <tbody className={showInputs ? 'editing-row' : ''}>
      <tr>
        {showLearnedToggle && !showInputs &&
          <td rowSpan="2" className="actions-cell max-width-fit-content">
            <Tooltip title={word.isLearned ? 'Зняти позначку «вивчене»' : 'Позначити як вивчене'}>
              <Checkbox
                checked={Boolean(word.isLearned)}
                onChange={() => onToggleLearned(word.id)}
                color="success"
                slotProps={{ input: { 'aria-label': word.isLearned ? 'Вивчено' : 'Не вивчено' } }}
              />
            </Tooltip>
          </td>}

        <td>
          {showInputs ? (
            <input {...register('word_text', { required: true })} className="table-input" />
          ) : (
            word.word_text
          )}
        </td>

        <td className='max-width-fit-content'>
          {!showInputs && (
            <PronounceButton text={word.word_text} />
          )}
        </td>

        <td>
          {showInputs ? (
            <input {...register('word_translation_uk', { required: true })} className="table-input" />
          ) : (
            word.word_translation_uk
          )}
        </td>

        {isAuthorized && (!isEditing || isEditing) &&
          <td rowSpan="2" className="actions-cell max-width-fit-content">
            {isEditing && (
              <Box className="edit-controls-vertical">
                {showInputs ? (
                  <>
                    <Tooltip title="Зберегти"><IconButton onClick={handleSubmit(onSubmit)} color="success"><Save /></IconButton></Tooltip>
                    <Tooltip title="Скасувати"><IconButton onClick={handleCancel} color="error"><Close /></IconButton></Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip title="Редагувати текст"><IconButton onClick={startLocalEdit}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Видалити слово"><IconButton onClick={() => onFullDelete(word.id)} color="error"><Delete /></IconButton></Tooltip>
                  </>
                )}
              </Box>
            )}
          </td>}
      </tr>

      <tr>
        <td>
          {showInputs ? (
            <input {...register('sentence_text')} className="table-input" placeholder="Речення-приклад..." />
          ) : (
            <span className="sentence-text">{word.sentence_text}</span>
          )}
        </td>

        <td className='max-width-fit-content'>
          {!showInputs && (
            <PronounceButton text={word.sentence_text} />
          )}
        </td>

        <td>
          {showInputs ? (
            <input {...register('sentence_translation_uk')} className="table-input" placeholder="Переклад речення..." />
          ) : (
            <span className="sentence-translation">{word.sentence_translation_uk}</span>
          )}
        </td>
      </tr>
    </tbody>
  );
};

export default WordTableRow;
