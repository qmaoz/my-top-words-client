import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WordTableRow from './WordTableRow';
import { DEFAULT_SOURCE_LOCALE, DEFAULT_TRANSLATION_LOCALES, getLocaleLabel } from './utils/locales';

export default function WordSetTable({
  words,
  isAuthorized,
  className,
  isEditing,
  showLearnedToggle,
  onToggleLearned,
  onUpdate,
  onFullDelete,
  sourceLocale = DEFAULT_SOURCE_LOCALE,
  translationLocales = DEFAULT_TRANSLATION_LOCALES,
}) {
  const { t } = useTranslation();
  const showHeader = translationLocales.length > 1;

  return (
    <Box className={className ?? ''}>
      <Box className="word-set-table-wrap">
      <table className="word-set-table">
        {showHeader && (
          <thead className="word-set-table__head">
            <tr>
              {showLearnedToggle && <th aria-label={t('word.learned')} />}
              <th className="word-set-table__head-cell">{getLocaleLabel(sourceLocale)}</th>
              <th aria-label={t('word.pronounceAria')} />
              {translationLocales.map((locale) => (
                <th key={locale} className="word-set-table__head-cell">{getLocaleLabel(locale)}</th>
              ))}
              {isAuthorized && <th aria-label={t('word.actions')} />}
            </tr>
          </thead>
        )}
        {words?.map((word) => (
          <WordTableRow
            key={word.id}
            word={word}
            isAuthorized={isAuthorized}
            isEditing={isEditing}
            showLearnedToggle={showLearnedToggle}
            onToggleLearned={onToggleLearned}
            onUpdate={onUpdate}
            onFullDelete={onFullDelete}
            sourceLocale={sourceLocale}
            translationLocales={translationLocales}
          />
        ))}
      </table>
      </Box>
    </Box>
  );
}
