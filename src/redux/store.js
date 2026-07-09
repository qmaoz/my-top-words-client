import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from './slices/auth';
import { wordSetsReducer } from './slices/word-sets';
import { wordsReducer } from './slices/words';
import { adminReducer } from './slices/admin';

const store = configureStore({
  reducer: {
    auth: authReducer,
    wordSets: wordSetsReducer,
    words: wordsReducer,
    admin: adminReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;