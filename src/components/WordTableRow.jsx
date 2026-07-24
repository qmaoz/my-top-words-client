import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconButton, Checkbox, Tooltip, Box } from '@mui/material';
import { Edit, Delete, Save, Close } from '@mui/icons-material';
import PronounceButton from './wrappers/PronounceButton';
import { DEFAULT_SOURCE_LOCALE, DEFAULT_TRANSLATION_LOCALES, getLocaleLabel } from './utils/locales';

function getWordFormValues(word, locales) {
  const values = {
    word_text: word.word_text ?? '',
    sentence_text: word.sentence_text ?? '',
  };

  locales.forEach((locale) => {
    const translation = word.translations?.[locale] ?? {};
    values[`word_${locale}`] = translation.word_translation ?? '';
    values[`sentence_${locale}`] = translation.sentence_translation ?? '';
  });

  return values;
}

function buildUpdatePayload(data, locales) {
  const translations = {};
  locales.forEach((locale) => {
    translations[locale] = {
      word_translation: data[`word_${locale}`] ?? '',
      sentence_translation: data[`sentence_${locale}`] ?? '',
    };
  });

  return {
    word_text: data.word_text,
    sentence_text: data.sentence_text,
    translations,
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
  sourceLocale = DEFAULT_SOURCE_LOCALE,
  translationLocales = DEFAULT_TRANSLATION_LOCALES,
}) => {
  const { t } = useTranslation();
  const [isLocalEdit, setIsLocalEdit] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: getWordFormValues(word, translationLocales),
  });

  useEffect(() => {
    if (!isEditing) {
      setIsLocalEdit(false);
      reset(getWordFormValues(word, translationLocales));
    }
  }, [isEditing, word, reset, translationLocales]);

  const showInputs = isEditing && isLocalEdit;

  const onSubmit = async (data) => {
    const shouldClose = await onUpdate(word.id, buildUpdatePayload(data, translationLocales));
    if (shouldClose !== false) {
      setIsLocalEdit(false);
    }
  };

  const handleCancel = () => {
    reset(getWordFormValues(word, translationLocales));
    setIsLocalEdit(false);
  };

  const startLocalEdit = () => {
    reset(getWordFormValues(word, translationLocales));
    setIsLocalEdit(true);
  };

  return (
    <tbody className={showInputs ? 'editing-row' : ''}>
      <tr>
        {showLearnedToggle && !showInputs &&
          <td rowSpan="2" className="actions-cell max-width-fit-content">
            <Tooltip title={word.isLearned ? t('word.unmarkLearned') : t('word.markLearned')}>
              <Checkbox
                checked={Boolean(word.isLearned)}
                onChange={() => onToggleLearned(word.id)}
                color="success"
                slotProps={{ input: { 'aria-label': word.isLearned ? t('word.learned') : t('word.notLearned') } }}
              />
            </Tooltip>
          </td>}

        <td>
          {showInputs ? (
            <input {...register('word_text', { required: true })} className="table-input" autoComplete="off" />
          ) : (
            word.word_text
          )}
        </td>

        <td className='max-width-fit-content'>
          {!showInputs && (
            <PronounceButton text={word.word_text} locale={sourceLocale} />
          )}
        </td>

        {translationLocales.map((locale) => (
          <td key={`word-${locale}`}>
            {showInputs ? (
              <input
                {...register(`word_${locale}`, { required: true })}
                className="table-input"
                autoComplete="off"
                placeholder={t('word.translationPlaceholder', { locale: getLocaleLabel(locale) })}
              />
            ) : (
              word.translations?.[locale]?.word_translation ?? ''
            )}
          </td>
        ))}

        {isAuthorized &&
          <td rowSpan="2" className="actions-cell max-width-fit-content">
            {isEditing && (
              <Box className="edit-controls-vertical">
                {showInputs ? (
                  <>
                    <Tooltip title={t('common.save')}><IconButton onClick={handleSubmit(onSubmit)} color="success"><Save /></IconButton></Tooltip>
                    <Tooltip title={t('common.cancel')}><IconButton onClick={handleCancel} color="error"><Close /></IconButton></Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip title={t('word.editText')}><IconButton onClick={startLocalEdit}><Edit /></IconButton></Tooltip>
                    <Tooltip title={t('word.deleteWord')}><IconButton onClick={() => onFullDelete(word.id)} color="error"><Delete /></IconButton></Tooltip>
                  </>
                )}
              </Box>
            )}
          </td>}
      </tr>

      <tr>
        <td>
          {showInputs ? (
            <input {...register('sentence_text')} className="table-input" autoComplete="off" placeholder={t('word.sentencePlaceholder')} />
          ) : (
            <span className="sentence-text">{word.sentence_text}</span>
          )}
        </td>

        <td className='max-width-fit-content'>
          {!showInputs && (
            <PronounceButton text={word.sentence_text} locale={sourceLocale} />
          )}
        </td>

        {translationLocales.map((locale) => (
          <td key={`sentence-${locale}`}>
            {showInputs ? (
              <input
                {...register(`sentence_${locale}`)}
                className="table-input"
                autoComplete="off"
                placeholder={t('word.sentenceTranslationPlaceholder', { locale: getLocaleLabel(locale) })}
              />
            ) : (
              <span className="sentence-translation">{word.translations?.[locale]?.sentence_translation ?? ''}</span>
            )}
          </td>
        ))}
      </tr>
    </tbody>
  );
};

export default WordTableRow;
