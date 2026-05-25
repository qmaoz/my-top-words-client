import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from './slices/auth';
import { wordSetsReducer } from './slices/word-sets';
import { wordsReducer } from './slices/words';

const store = configureStore({
  reducer: {
    auth: authReducer,
    wordSets: wordSetsReducer,
    words: wordsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;