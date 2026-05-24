import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../../axios'; 

export const createNewWord = createAsyncThunk('words/createNewWord',
  async (wordData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/words', wordData);
      return data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Сервер недоступний або сталася помилка мережі' });
    }
  }
);

export const fetchWords = createAsyncThunk(
  'words/fetchWords', 
  async ({ page, limit, filter }) => {
    const url = filter 
      ? `/words?page=${page}&limit=${limit}&filter=${filter}`
      : `/words?page=${page}&limit=${limit}`;
    const { data } = await axios.get(url);
    return { ...data, filter };
  }
);

export const updateWord = createAsyncThunk('words/updateWord',
  async ({ id, word_text, word_translation_uk, sentence_text, sentence_translation_uk }) => {
    const updateBody = {};
    if (word_text != null) updateBody.word_text = word_text;
    if (word_translation_uk != null) updateBody.word_translation_uk = word_translation_uk;
    if (sentence_text != null) updateBody.sentence_text = sentence_text;
    if (sentence_translation_uk != null) updateBody.sentence_translation_uk = sentence_translation_uk;

    const { data } = await axios.patch(`/words/${id}`, updateBody);
    return data;
  }
);

export const toggleWordSave = createAsyncThunk(
  'words/toggleWordSave',
  async ({ id }) => {
    const { data } = await axios.patch(`/words/toggle-save/${id}`);
    return { id, isSavedForLearning: data.isSavedForLearning };
  }
);

export const deleteWord = createAsyncThunk(
  'words/deleteWord',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/words/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data);
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
  top: { ...listInitialState },     // popular public words (homepage)
  own: { ...listInitialState },     // my words (profile page)
  saved: { ...listInitialState },   // saved words (profile page)
  learned: { ...listInitialState }, // learned words (profile page)
  operationStatus: 'loading',       // status of the operation (example: creating a new word, deleting, updating)
};

const wordsSlice = createSlice({
  name: 'words',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(createNewWord.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(createNewWord.rejected, (state) => {
        state.operationStatus = 'error';
      })
      .addCase(createNewWord.fulfilled, (state) => {
        state.operationStatus = 'loaded';
      })

      .addCase(fetchWords.pending, (state, action) => {
        const filter = action.meta.arg.filter || 'top';
        state[filter].status = 'loading';
      })
      .addCase(fetchWords.rejected, (state, action) => {
        const filter = action.meta.arg.filter || 'top';
        state[filter].status = 'error';
      })
      .addCase(fetchWords.fulfilled, (state, action) => {
        const filter = action.payload.filter || 'top';
        state[filter].items = action.payload.items;
        state[filter].totalPages = action.payload.totalPages;
        state[filter].currentPage = action.payload.currentPage;
        state[filter].totalItems = action.payload.totalItems;
        state[filter].status = 'loaded';
      })

      .addCase(toggleWordSave.fulfilled, (state, action) => {
        const { id, isSavedForLearning } = action.payload;
        
        const updateInList = (listKey) => {
          const item = state[listKey].items.find(obj => Number(obj.id) === Number(id));
          if (item) item.isSavedForLearning = isSavedForLearning;
        };

        ['top', 'own', 'saved', 'learned'].forEach(updateInList);
      })
      .addCase(updateWord.fulfilled, (state, action) => {
        const { id, word_text, word_translation_uk, sentence_text, sentence_translation_uk } = action.payload;
        
        const updateInList = (listKey) => {
          const word = state[listKey].items.find(obj => Number(obj.id) === Number(id));
          if (word_text != null) word.word_text = word_text;
          if (word_translation_uk != null) word.word_translation_uk = word_translation_uk;
          if (sentence_text != null) word.sentence_text = sentence_text;
          if (sentence_translation_uk != null) word.sentence_translation_uk = sentence_translation_uk;
        };

        ['top', 'own', 'saved', 'learned'].forEach(updateInList);
      })

      .addCase(deleteWord.fulfilled, (state, action) => {
        const deletedId = action.payload;
  
        ['top', 'own', 'saved', 'learned'].forEach(listKey => {
          if (state[listKey]?.items) {
            state[listKey].items = state[listKey].items.filter(w => w.id !== deletedId);
          }
        });
      });
  },
});

export const wordsReducer = wordsSlice.reducer;