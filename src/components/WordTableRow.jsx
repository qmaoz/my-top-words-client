import { useForm } from 'react-hook-form';
import { IconButton, Checkbox, Tooltip, Box } from '@mui/material';
import { Edit, Delete, Save, Close, VolumeUp, DeleteSweep } from '@mui/icons-material';
import { useState } from 'react';
import PronounceButton from './wrappers/PronounceButton';

const WordTableRow = ({ 
  word, 
  isAuthorized,
  isEditing,
  onUpdate,
  onFullDelete,
}) => {
  const [isLocalEdit, setIsLocalEdit] = useState(false);
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      word_text: word.word_text,
      word_translation_uk: word.word_translation_uk,
      sentence_text: word.sentence_text,
      sentence_translation_uk: word.sentence_translation_uk,
    }
  });

  const onSubmit = (data) => {
    onUpdate(word.id, data);
    setIsLocalEdit(false);
  };

  const handleCancel = () => {
    reset();
    setIsLocalEdit(false);
  };

  return (
    <tbody className={isLocalEdit ? 'editing-row' : ''}>
      <tr>
        <td>
          {isLocalEdit ? (
            <input {...register('word_text', { required: true })} className="table-input" />
          ) : (
            word.word_text
          )}
        </td>

        <td className='max-width-fit-content'>
          {!isLocalEdit && (
            <PronounceButton text={word.word_text} />
          )}
        </td>

        <td>
          {isLocalEdit ? (
            <input {...register('word_translation_uk', { required: true })} className="table-input" />
          ) : (
            word.word_translation_uk
          )}
        </td>
 
        {isAuthorized && !isEditing || isEditing &&
          <td rowSpan="2" className="actions-cell max-width-fit-content">
            {isEditing && (
              <Box className="edit-controls-vertical">
                {isLocalEdit ? (
                  <>
                    <Tooltip title="Зберегти"><IconButton onClick={handleSubmit(onSubmit)} color="success"><Save /></IconButton></Tooltip>
                    <Tooltip title="Скасувати"><IconButton onClick={handleCancel} color="error"><Close /></IconButton></Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip title="Редагувати текст"><IconButton onClick={() => setIsLocalEdit(true)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Видалити слово повністю"><IconButton onClick={() => onFullDelete(word.id)} color="error"><Delete /></IconButton></Tooltip>
                  </>
                )}
              </Box>
            )}
          </td>}
      </tr>

      <tr>
        <td>
          {isLocalEdit ? (
            <input {...register('sentence_text')} className="table-input" placeholder="Речення-приклад..." />
          ) : (
            <span className="sentence-text">{word.sentence_text}</span>
          )}
        </td>

        <td className='max-width-fit-content'>
          {!isLocalEdit && (
            <PronounceButton text={word.sentence_text} />
          )}
        </td>

        <td>
          {isLocalEdit ? (
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