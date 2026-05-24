import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../../axios';
import { logout } from './auth'; 
import { deleteWord } from './words';

export const createNewWordSet = createAsyncThunk('wordSets/createNewWordSet', async (name, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/word-sets', { name });
    return data;
  } catch (error) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: 'Сервер недоступний або сталася помилка мережі' });
  }
});

export const fetchWordSets = createAsyncThunk(
  'wordSets/fetchWordSets', 
  async ({ page, limit, filter }) => {
    const url = filter 
      ? `/word-sets?page=${page}&limit=${limit}&filter=${filter}`
      : `/word-sets?page=${page}&limit=${limit}`;
    const { data } = await axios.get(url);
    return { ...data, filter };
  }
);

export const fetchWordSet = createAsyncThunk('wordSets/fetchWordSet', async (id) => {
  const { data } = await axios.get(`/word-sets/${id}`);
  return data;
});

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

// export const addProgressToActiveItem = createAsyncThunk('wordSets/addProgressToActiveItem', async () => {
//   return
// });

export const toggleWordSetSave = createAsyncThunk(
  'wordSets/toggleWordSetSave',
  async ({ id }) => {
    const { data } = await axios.patch(`/word-sets/toggle-save/${id}`);
    return { id, isSavedForLearning: data.isSavedForLearning };
  }
);

export const updateWordSetWords = createAsyncThunk(
  'wordSets/updateWordSetWords',
  async ({ wordSetId, wordIds }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/word-sets/${wordSetId}/words`, { wordIds });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Помилка оновлення слів у наборі' });
    }
  }
);

export const removeWordFromSet = createAsyncThunk(
  'wordSets/removeWordFromSet',
  async ({ wordSetId, wordId }, { rejectWithValue }) => {
    try {
      await axios.delete(`/word-sets/${wordSetId}/words/${wordId}`);
      return wordId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Не вдалося вилучити слово з набору' });
    }
  }
);

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
  all: { ...listInitialState },   // popular wordSets (homepage)
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
        const filter = action.meta.arg.filter || 'all';
        state[filter].status = 'loading';
      })
      .addCase(fetchWordSets.rejected, (state, action) => {
        const filter = action.meta.arg.filter || 'all';
        state[filter].status = 'error';
      })
      .addCase(fetchWordSets.fulfilled, (state, action) => {
        const filter = action.payload.filter || 'all';
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

        ['all', 'own', 'saved'].forEach(updateInList);
      })
      .addCase(updateWordSet.fulfilled, (state, action) => {
        if (action.payload) {
          const { name, is_public: isPublic } = action.payload;
          if (isPublic != null) state.activeItem.is_public = isPublic;
          if (name != null) state.activeItem.name = name;
          state.activeItemStatus = 'loaded';
        } else {
          state.activeItemStatus = 'error';
        }
      })
      .addCase(logout, (state) => {
        if (state.activeItem) {
          delete state.activeItem.isSavedForLearning;
          state.activeItem.words.forEach(word => {
            delete word.isWordLearned;
            delete word.word_learning_status_id;
          });
        }

        const clearPersonalData = (listKey) => {
          state[listKey].items.forEach(item => {
            delete item.numWordsLearned;
            delete item.isSavedForLearning;
          });
        };
        ['all', 'own', 'saved'].forEach(clearPersonalData);
      })

      .addCase(updateWordSetWords.fulfilled, (state, action) => {
        if (state.activeItem) {
          state.activeItem.words = action.payload.words;
          state.activeItemStatus = 'loaded';
        } else {
          state.activeItemStatus = 'error';
        }
      })

      .addCase(removeWordFromSet.pending, (state) => {
        state.activeItemStatus = 'loading';
      })
      .addCase(removeWordFromSet.fulfilled, (state, action) => {
        const removedWordId = action.payload;
        
        if (state.activeItem && state.activeItem.words) {
          state.activeItem.words = state.activeItem.words.filter(
            (word) => word.id != removedWordId
          );
        }

        state.activeItemStatus = 'loaded';
      })
      .addCase(removeWordFromSet.rejected, (state) => {
        state.activeItemStatus = 'error';
      })

      .addCase(deleteWord.fulfilled, (state, action) => {
        const deletedWordId = action.payload; 

        if (state.activeItem && state.activeItem.words) {
          state.activeItem.words = state.activeItem.words.filter(
            (word) => word.id !== deletedWordId
          );
        }
      })
      
      .addCase(deleteWordSet.fulfilled, (state) => {
        state.activeItem = null; // selectedWordIds
        state.activeItemStatus = 'loaded';
      });
  },
});

export const wordSetsReducer = wordSetsSlice.reducer;