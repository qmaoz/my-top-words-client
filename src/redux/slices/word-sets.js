import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../../axios';
import { logout } from './auth'; 
import { deleteWord, updateWord } from './words';

export const createNewWordSet = createAsyncThunk('wordSets/createNewWordSet', async (name, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/word-sets', { name });
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

// HERE: add rejectWithValue
export const fetchWordSets = createAsyncThunk(
  'wordSets/fetchWordSets', 
  async ({ page, limit, filter, partOfName }) => {
    let url = `/word-sets?page=${page}&limit=${limit}`; 
    if (filter) url = url + `&filter=${filter}`;
    if (partOfName != null && partOfName.trim() != '') url = url + `&partOfName=${partOfName}`;
    const { data } = await axios.get(url);
    return { ...data, filter };
  }
);

// HERE: add rejectWithValue
export const fetchWordSet = createAsyncThunk('wordSets/fetchWordSet', async (id) => {
  const { data } = await axios.get(`/word-sets/${id}`);
  return data;
});

// HERE: add rejectWithValue
export const updateWordSet = createAsyncThunk('wordSets/updateWordSet', async ({ id, name, setIsPublic }) => {
  const newName = name?.trim();

  const updateBody = {};
  if (newName != null && newName.length > 0 && newName.length < 128) updateBody.name = newName;
  if (setIsPublic != null) updateBody.setIsPublic = setIsPublic;

  if (Object.keys(updateBody).length > 0) {
    const { data } = await axios.patch(`/word-sets/${id}`, updateBody);
    return data;
  }
});

export const toggleWordSetSave = createAsyncThunk(
  'wordSets/toggleWordSetSave',
  async ({ id }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/word-sets/toggle-save/${id}`);
      return { id, isSavedForLearning: data.isSavedForLearning };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
    }
    
  }
);

export const updateWordSetWords = createAsyncThunk(
  'wordSets/updateWordSetWords',
  async ({ wordSetId, wordIds }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/word-sets/${wordSetId}/words`, { wordIds });
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
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
      return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
    }
  }
);

// HERE: add rejectWithValue
export const deleteWordSet = createAsyncThunk(
  'wordSets/deleteWordSet',
  async (id) => {
    const { data } = await axios.delete(`/word-sets/${id}`);
    return data;
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
        state.activeItem = action.payload;
        state.activeItemStatus = 'loaded';
      })

      .addCase(fetchWordSet.pending, (state) => {
        state.activeItem = null;
        state.activeItemStatus = 'loading';
      })
      .addCase(fetchWordSet.rejected, (state) => {
        state.activeItem = null;
        state.activeItemStatus = 'error';
      })
      .addCase(fetchWordSet.fulfilled, (state, action) => {
        state.activeItem = action.payload;
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
      .addCase(updateWordSet.fulfilled, (state, action) => {
        if (action.payload) {
          const { name, is_public: isPublic } = action.payload;
          if (isPublic != null) state.activeItem.is_public = isPublic;
          if (name != null) state.activeItem.name = name;
        }
      })

      .addCase(logout, (state) => {
        delete state?.activeItem?.isSavedForLearning;
      })

      .addCase(updateWordSetWords.fulfilled, (state, action) => {
        if (state?.activeItem) {
          state.activeItem.words = action.payload.words;
        }
      })

      .addCase(toggleIncludeWordInWordSet.fulfilled, (state, action) => {
        const toggledWordId = action.payload.wordId;
        const actionName = action.payload.actionName;
        const word = action.payload.word;
        
        if (state?.activeItem?.words) {
          if (actionName == 'remove') {
            state.activeItem.words = state.activeItem.words.filter(
              (word) => word.id != toggledWordId
            );
          } else if (actionName == 'include') {
            state.activeItem.words.unshift(word);
          }
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
        const { id, word_text, word_translation_uk, sentence_text, sentence_translation_uk } = action.payload.updatedWord;

        if (state?.activeItem?.words) {
          const word = state.activeItem.words.find(obj => Number(obj.id) === Number(id));
          if (word) {
            if (word_text != null) word.word_text = word_text;
            if (word_translation_uk != null) word.word_translation_uk = word_translation_uk;
            if (sentence_text != null) word.sentence_text = sentence_text;
            if (sentence_translation_uk != null) word.sentence_translation_uk = sentence_translation_uk;
          }
        }
      })
      
      .addCase(deleteWordSet.fulfilled, (state) => {
        state.activeItem = null;
      });
  },
});

export const wordSetsReducer = wordSetsSlice.reducer;