import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../../axios';
import { tr } from '../../components/utils/translate';
import { logout } from './auth';
import { deleteWord, updateWord } from './words';

export const createNewWordSet = createAsyncThunk('wordSets/createNewWordSet', async (arg, { rejectWithValue }) => {
  const payload = typeof arg === 'object' && arg !== null
    ? {
        name: arg.name,
        source_locale: arg.source_locale,
        translation_locales: arg.translation_locales,
      }
    : { name: arg };

  try {
    const { data } = await axios.post('/word-sets', payload);
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
  }
});

export const fetchWordSets = createAsyncThunk(
  'wordSets/fetchWordSets', 
  async ({ page, limit, filter, partOfName }, { rejectWithValue }) => {
    let url = `/word-sets?page=${page}&limit=${limit}`; 
    if (filter) url = url + `&filter=${filter}`;
    if (partOfName != null && partOfName.trim() != '') url = url + `&partOfName=${partOfName}`;

    try {
      const { data } = await axios.get(url);
      return { ...data, filter };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
);

export const fetchWordSet = createAsyncThunk(
  'wordSets/fetchWordSet',
  async (arg, { rejectWithValue, getState }) => {
    const id = typeof arg === 'object' ? arg.id : arg;
    const force = typeof arg === 'object' ? Boolean(arg.force) : false;
    const state = getState().wordSets;

    if (
      !force
      && state.activeItem
      && Number(state.activeItem.id) === Number(id)
      && state.activeItemStatus === 'loaded'
    ) {
      return state.activeItem;
    }

    try {
      const { data } = await axios.get(`/word-sets/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  },
  {
    condition: (arg, { getState }) => {
      const id = typeof arg === 'object' ? arg.id : arg;
      const force = typeof arg === 'object' ? Boolean(arg.force) : false;
      if (force) return true;

      const { activeItem, activeItemStatus } = getState().wordSets;
      return !(
        activeItem
        && Number(activeItem.id) === Number(id)
        && activeItemStatus === 'loaded'
      );
    },
  },
);

export const updateWordSet = createAsyncThunk('wordSets/updateWordSet', async ({ id, name, visibility, setIsPublic, source_locale, translation_locales }, { rejectWithValue }) => {
  const newName = name?.trim();

  const updateBody = {};
  if (newName != null && newName.length > 0 && newName.length < 128) updateBody.name = newName;
  if (visibility != null) updateBody.visibility = visibility;
  else if (setIsPublic != null) updateBody.setIsPublic = setIsPublic;
  if (source_locale != null) updateBody.source_locale = source_locale;
  if (translation_locales != null) updateBody.translation_locales = translation_locales;

  if (Object.keys(updateBody).length > 0) {
    try {
      const { data } = await axios.patch(`/word-sets/${id}`, updateBody);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
});

export const toggleWordSetSave = createAsyncThunk(
  'wordSets/toggleWordSetSave',
  async ({ id }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/word-sets/toggle-save/${id}`);
      return { id, isSavedForLearning: data.isSavedForLearning };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
    
  }
);

export const toggleIncludeWordInWordSet = createAsyncThunk(
  'wordSets/toggleIncludeWordInWordSet',
  async ({ wordSetId, wordId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/word-sets/${wordSetId}/words/${wordId}`);
      return { wordId, actionName: data.actionName, word: data.word };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
);

export const bulkImportWords = createAsyncThunk(
  'wordSets/bulkImportWords',
  async ({ wordSetId, words }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/word-sets/${wordSetId}/words/bulk`, { words });
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
);

export const syncWordSetWords = createAsyncThunk(
  'wordSets/syncWordSetWords',
  async ({ wordSetId, words }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/word-sets/${wordSetId}/words/sync`, { words });
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
);

export const clearWordSetWords = createAsyncThunk(
  'wordSets/clearWordSetWords',
  async (wordSetId, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/word-sets/${wordSetId}/words`);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
);

export const toggleWordLearned = createAsyncThunk(
  'wordSets/toggleWordLearned',
  async ({ wordId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/words/toggle-learned/${wordId}`);
      return { wordId, isLearned: data.isLearned };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
);

export const reviewWordProgress = createAsyncThunk(
  'wordSets/reviewWordProgress',
  async ({ wordId, outcome }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/words/${wordId}/review`, { outcome });
      return {
        wordId,
        isLearned: Boolean(data.isLearned),
        hasProgress: Boolean(data.hasProgress),
        nextAt: data.nextAt ?? null,
        reviewStage: data.reviewStage ?? 0,
      };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
);

export const deleteWordSet = createAsyncThunk(
  'wordSets/deleteWordSet',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/word-sets/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
);

const listInitialState = {
  items: [],
  totalPages: 0,
  currentPage: 0,
  totalItems: 0,
  status: 'loading',
};

const initialState = {
  top: { ...listInitialState },   // top popular wordSets (homepage)
  own: { ...listInitialState },   // my wordSets (profile page)
  saved: { ...listInitialState }, // saved wordSets (profile page)
  activeItem: null,               // for one wordSet page
  activeItemStatus: 'loading'     // one wordSet upload status
};

const wordSetsSlice = createSlice({
  name: 'word-sets',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(createNewWordSet.pending, (state) => {
        state.activeItem = null;
        state.activeItemStatus = 'loading';
      })
      .addCase(createNewWordSet.rejected, (state) => {
        state.activeItem = null;
        state.activeItemStatus = 'error';
      })
      .addCase(createNewWordSet.fulfilled, (state, action) => {
        state.activeItem = {
          ...action.payload,
          words: Array.isArray(action.payload?.words) ? action.payload.words : [],
        };
        state.activeItemStatus = 'loaded';
      })

      .addCase(fetchWordSet.pending, (state) => {
        state.activeItemStatus = 'loading';
      })
      .addCase(fetchWordSet.rejected, (state) => {
        state.activeItem = null;
        state.activeItemStatus = 'error';
      })
      .addCase(fetchWordSet.fulfilled, (state, action) => {
        state.activeItem = {
          ...action.payload,
          words: Array.isArray(action.payload?.words) ? action.payload.words : [],
        };
        state.activeItemStatus = 'loaded';
      })

      .addCase(fetchWordSets.pending, (state, action) => {
        const filter = action.meta.arg.filter || 'top';
        state[filter].status = 'loading';
      })
      .addCase(fetchWordSets.rejected, (state, action) => {
        const filter = action.meta.arg.filter || 'top';
        state[filter].status = 'error';
      })
      .addCase(fetchWordSets.fulfilled, (state, action) => {
        const filter = action.payload.filter || 'top';
        state[filter].items = action.payload.items;
        state[filter].totalPages = action.payload.totalPages;
        state[filter].currentPage = action.payload.currentPage;
        state[filter].totalItems = action.payload.totalItems;
        state[filter].status = 'loaded';
      })

      .addCase(toggleWordSetSave.fulfilled, (state, action) => {
        const { id, isSavedForLearning } = action.payload;

        if (state.activeItem && Number(state.activeItem.id) === Number(id)) {
          state.activeItem.isSavedForLearning = isSavedForLearning;
        }

        const updateInList = (listKey) => {
          const item = state[listKey].items.find(obj => Number(obj.id) === Number(id));
          if (item) item.isSavedForLearning = isSavedForLearning;
        };

        ['top', 'own', 'saved'].forEach(updateInList);
      })
      .addCase(toggleWordLearned.fulfilled, (state, action) => {
        const { wordId, isLearned } = action.payload;

        if (state?.activeItem?.words) {
          const word = state.activeItem.words.find(obj => Number(obj.id) === Number(wordId));
          if (word) {
            word.isLearned = isLearned;
            if (isLearned) {
              word.hasProgress = false;
              word.nextAt = null;
              word.reviewStage = 0;
            }
          }
          state.activeItem.learnedWordsCount = state.activeItem.words.filter((w) => w.isLearned).length;
        }

        const wordSetId = state.activeItem?.id;
        if (wordSetId != null && state.activeItem?.learnedWordsCount != null) {
          const count = state.activeItem.learnedWordsCount;
          const updateInList = (listKey) => {
            const item = state[listKey].items.find(obj => Number(obj.id) === Number(wordSetId));
            if (item) item.learnedWordsCount = count;
          };

          ['top', 'own', 'saved'].forEach(updateInList);
        }
      })
      .addCase(reviewWordProgress.fulfilled, (state, action) => {
        const { wordId, isLearned, hasProgress, nextAt, reviewStage } = action.payload;
        if (!state?.activeItem?.words) return;

        const word = state.activeItem.words.find((obj) => Number(obj.id) === Number(wordId));
        if (!word) return;

        word.isLearned = isLearned;
        word.hasProgress = hasProgress;
        word.nextAt = nextAt;
        word.reviewStage = reviewStage;
        state.activeItem.learnedWordsCount = state.activeItem.words.filter((w) => w.isLearned).length;
      })
      .addCase(updateWordSet.fulfilled, (state, action) => {
        if (action.payload) {
          const { name, visibility, is_public: isPublic, source_locale, translation_locales } = action.payload;
          if (visibility != null) state.activeItem.visibility = visibility;
          if (isPublic != null) state.activeItem.is_public = isPublic;
          if (name != null) state.activeItem.name = name;
          if (source_locale != null) state.activeItem.source_locale = source_locale;
          if (translation_locales != null) {
            state.activeItem.translation_locales = translation_locales;
            if (state.activeItem.words) {
              const allowed = new Set(translation_locales);
              state.activeItem.words.forEach((word) => {
                if (word.translations) {
                  Object.keys(word.translations).forEach((locale) => {
                    if (!allowed.has(locale)) delete word.translations[locale];
                  });
                }
              });
            }
          }
        }
      })

      .addCase(logout, (state) => {
        delete state?.activeItem?.isSavedForLearning;
        delete state?.activeItem?.learnedWordsCount;
        if (state?.activeItem?.words) {
          state.activeItem.words.forEach((word) => {
            delete word.isLearned;
          });
        }

        ['top', 'own', 'saved'].forEach((listKey) => {
          state[listKey].items.forEach((item) => {
            delete item.learnedWordsCount;
          });
        });
      })

      .addCase(toggleIncludeWordInWordSet.fulfilled, (state, action) => {
        const toggledWordId = action.payload.wordId;
        const actionName = action.payload.actionName;
        const word = action.payload.word;

        if (!state?.activeItem) {
          return;
        }

        if (!Array.isArray(state.activeItem.words)) {
          state.activeItem.words = [];
        }

        if (actionName == 'remove') {
          state.activeItem.words = state.activeItem.words.filter(
            (item) => item.id != toggledWordId
          );
        } else if (actionName == 'include' && word) {
          state.activeItem.words.unshift(word);
        }
      })

      .addCase(bulkImportWords.fulfilled, (state, action) => {
        const importedWords = action.payload?.words ?? [];
        const wordSetId = action.meta?.arg?.wordSetId;

        if (!state.activeItem || Number(state.activeItem.id) !== Number(wordSetId)) {
          return;
        }

        if (importedWords.length === 0) {
          return;
        }

        const existingWords = Array.isArray(state.activeItem.words)
          ? state.activeItem.words
          : [];

        state.activeItem.words = [...importedWords, ...existingWords];
      })

      .addCase(syncWordSetWords.fulfilled, (state, action) => {
        const wordSetId = action.meta?.arg?.wordSetId;

        if (!state.activeItem || Number(state.activeItem.id) !== Number(wordSetId)) {
          return;
        }

        const previousByKey = new Map(
          (state.activeItem.words ?? []).map((word) => [
            [
              String(word.word_text ?? '').trim().toLowerCase(),
              String(word.sentence_text ?? '').trim().toLowerCase(),
            ].join('\u0001'),
            word,
          ]),
        );

        const nextWords = (action.payload?.words ?? []).map((word) => {
          const key = [
            String(word.word_text ?? '').trim().toLowerCase(),
            String(word.sentence_text ?? '').trim().toLowerCase(),
          ].join('\u0001');
          const previous = previousByKey.get(key);

          return {
            ...word,
            isLearned: previous?.isLearned ?? false,
            hasProgress: previous?.hasProgress ?? false,
            nextAt: previous?.nextAt ?? null,
            reviewStage: previous?.reviewStage ?? 0,
          };
        });

        state.activeItem.words = nextWords;
        state.activeItem.learnedWordsCount = nextWords.filter((word) => word.isLearned).length;
      })

      .addCase(clearWordSetWords.fulfilled, (state) => {
        if (state?.activeItem?.words) {
          state.activeItem.words = [];
        }
        if (state?.activeItem) {
          state.activeItem.learnedWordsCount = 0;
        }
      })

      .addCase(deleteWord.fulfilled, (state, action) => {
        const deletedWordId = action.payload; 

        if (state?.activeItem?.words) {
          state.activeItem.words = state.activeItem.words.filter(
            (word) => word.id !== deletedWordId
          );
        }
      })

      .addCase(updateWord.fulfilled, (state, action) => {
        const updatedWord = action.payload.updatedWord;

        if (state?.activeItem?.words) {
          const word = state.activeItem.words.find(obj => Number(obj.id) === Number(updatedWord.id));
          if (word) {
            if (updatedWord.word_text != null) word.word_text = updatedWord.word_text;
            if (updatedWord.sentence_text != null) word.sentence_text = updatedWord.sentence_text;
            if (updatedWord.translations != null) word.translations = updatedWord.translations;
            word.word_translation_uk = updatedWord.word_translation_uk;
            word.sentence_translation_uk = updatedWord.sentence_translation_uk;
          }
        }
      })
      
      .addCase(deleteWordSet.fulfilled, (state) => {
        state.activeItem = null;
      });
  },
});

export const wordSetsReducer = wordSetsSlice.reducer;