import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import WordSetCard from '../components/WordSetCard';
import Typography from '@mui/material/Typography';
import { ErrorMessage, WarningMessage } from './messages';

export default function WordSetCardGroup({ id, title, wordSets, status, limit, count, page, onChange, mb }) {
  return (
    <>
      {title && <h3>{title}</h3>}
      {status !== 'error' && count > 1 &&
        <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
          <Pagination
            count={count}
            page={page}
            onChange={onChange}
            color="primary"
            shape="rounded"
            size="large"
            disabled={status !== 'loaded'}
          />
        </Stack>
      }

      <div className={'word-set-card-group mb-' + mb} id={id}>
        {status === 'error' && (
          <ErrorMessage message={'Помилка при завантаженні наборів. Спробуйте оновити сторінку'} />
        )}

        {status === 'loaded' && wordSets.length === 0 && (
          <WarningMessage message={'Немає наборів'} />
        )}

        {(status === 'loading' ? [...Array(limit)] : wordSets).map((obj, index) => (
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
                numWordsLearned={obj.numWordsLearned}
                isSavedForLearning={obj.isSavedForLearning}
              />
            ) : ''
          )
        ))}
      </div>

      {status !== 'error' && count > 1 &&
        <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
          <Pagination
            count={count}
            page={page}
            onChange={onChange}
            color="primary"
            shape="rounded"
            size="large"
            disabled={status !== 'loaded'}
          />
        </Stack>
      }
    </>
  );
}