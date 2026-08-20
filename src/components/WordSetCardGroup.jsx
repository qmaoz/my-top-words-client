import { useTranslation } from 'react-i18next';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Box, TextField } from '@mui/material';

import WordSetCard from '../components/WordSetCard';
import { ErrorMessage, WarningMessage } from './utils/messages';
import { selectUserData } from '../redux/slices/auth';
import { useSelector } from 'react-redux';

export default function WordSetCardGroup({
  title,
  wordSets,
  status,
  limit,
  count,
  page,
  searchValue = '',
  onSearchChange,
  searchInputName,
  onChange,
  className,
  showSave = true,
  canDelete = false,
  onDeleted,
}) {
  const { t } = useTranslation();
  const userId = useSelector(selectUserData)?.id;
  const rootClassName = ['word-set-list', className].filter(Boolean).join(' ');

  return (
    <>
      <Box className={rootClassName}>
        {title && title.trim() != '' && <h3>{title}</h3>}

        <Box className="search-card content-block">
          <TextField
            name={searchInputName}
            label={t('wordSet.searchByName')}
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            fullWidth
            size="small"
            autoComplete="off"
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />
        </Box>

        {status === 'loaded' && count > 1 &&
          <Stack spacing={2} className='aic'>
            <Pagination
              count={count}
              page={page}
              onChange={onChange}
              color="primary"
              shape="rounded"
              size="medium"
              disabled={status !== 'loaded'}
            />
          </Stack>
        }

        <Box className={'word-set-card-group'}>
          {status === 'error' && (
            <ErrorMessage message={t('wordSet.loadListError')} />
          )}

          {status === 'loaded' && (!wordSets || wordSets?.length === 0) && (
            <WarningMessage message={t('wordSet.notFound')} className='m-0' />
          )}

          {(status === 'loading' ? [...Array(limit)] : wordSets)?.map((obj, index) => (
            status === 'loading' ? (
              <WordSetCard key={`skeleton-${index}`} isLoading={true} />
            ) : (
              status !== 'error' ? (
                <WordSetCard
                  key={obj.id}
                  id={obj.id}
                  title={obj.name}
                  link={`/word-set/${obj.id}`}
                  totalWords={obj.totalWords}
                  sourceLocale={obj.source_locale}
                  translationLocales={obj.translation_locales}
                  learnedWordsCount={obj.learnedWordsCount}
                  isSavedForLearning={obj.isSavedForLearning}
                  showSave={
                    showSave
                    && (
                      Number(obj.owner_user_id) !== Number(userId)
                      || Boolean(obj.isSavedForLearning)
                    )
                  }
                  canDelete={canDelete}
                  onDeleted={onDeleted}
                />
              ) : ''
            )
          ))}
        </Box>

        {status === 'loaded' && count > 1 &&
          <Stack spacing={2} className='aic'>
            <Pagination
              count={count}
              page={page}
              onChange={onChange}
              color="primary"
              shape="rounded"
              size="medium"
              disabled={status !== 'loaded'}
            />
          </Stack>
        }
      </Box>
    </>
  );
}
