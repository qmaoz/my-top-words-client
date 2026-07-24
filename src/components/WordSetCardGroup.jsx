import { useTranslation } from 'react-i18next';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import WordSetCard from '../components/WordSetCard';
import Typography from '@mui/material/Typography';
import { ErrorMessage, WarningMessage } from './utils/messages';
import { Box, Button } from '@mui/material';
import FormInput from './form/FormInput';

export default function WordSetCardGroup({ title, wordSets, status, limit, count, page, searchInputName, onChange, className, register, handleSubmit, onSubmitForm, errors }) {
  const { t } = useTranslation();
  const rootClassName = ['word-set-list', className].filter(Boolean).join(' ');

  return (
    <>
      <Box className={rootClassName}>
        {title && title.trim() != '' && <h3>{title}</h3>}

        <form onSubmit={handleSubmit(onSubmitForm)} className="inline-form-row df ais gap-3" autoComplete="off">
          <FormInput
            name={searchInputName}
            label={t('wordSet.searchByName')}
            register={register}
            errors={errors}
            fullWidth
            maxLength={255}
            className='m-0'
          />
          <Button type='submit' color='primary' variant='contained' className='ps-3 pe-3'>{t('common.find')}</Button>
        </form>

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
                  learnedWordsCount={obj.learnedWordsCount}
                  isSavedForLearning={obj.isSavedForLearning}
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
