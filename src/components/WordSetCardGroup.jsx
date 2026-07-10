import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import WordSetCard from '../components/WordSetCard';
import Typography from '@mui/material/Typography';
import { ErrorMessage, WarningMessage } from './utils/messages';
import { Box, Button } from '@mui/material';
import FormInput from './form/FormInput';

export default function WordSetCardGroup({ title, wordSets, status, limit, count, page, searchInputName, onChange, className, register, handleSubmit, onSubmitForm, errors }) {  
  return (
    <>
      <Box className={className}>
        {title && title.trim() != '' && <h3>{title}</h3>}

        <form onSubmit={handleSubmit(onSubmitForm)} className="inline-form-row mt-3 mb-3 df ais gap-3">
          <FormInput
            name={searchInputName}
            label="Пошук за назвою набору"
            register={register}
            errors={errors}
            fullWidth
            maxLength={255}
            className='m-0'
          />
          <Button type='submit' color='primary' variant='contained' className='ps-3 pe-3'>Знайти</Button>
        </form>

        {status === 'loaded' && count > 1 &&
          <Stack spacing={2} className='mb-3 mt-3 aic'>
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
            <ErrorMessage message={'Помилка при завантаженні наборів. Спробуйте оновити сторінку'} />
          )}

          {status === 'loaded' && (!wordSets || wordSets?.length === 0) && (
            <WarningMessage message={'Наборів не знайдено'} className='m-0' />
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
          <Stack spacing={2} className='mt-3 aic'>
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