import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../../axios'; 

export const createNewWord = createAsyncThunk('words/createNewWord',
  async (wordData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/words', wordData);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
    }
  }
);

export const fetchWords = createAsyncThunk(
  'words/fetchWords', 
  async ({ page, limit, filter }, { rejectWithValue }) => {
    let url = `/words?page=${page}&limit=${limit}`; 
    if (filter) url = url + `&filter=${filter}`;

    try {
      const { data } = await axios.get(url);
      return { ...data, filter };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
    }
  }
);

export const updateWord = createAsyncThunk('words/updateWord',
  async ({ id, word_text, word_translation_uk, sentence_text, sentence_translation_uk }, { rejectWithValue }) => {
    const updateBody = {};
    if (word_text != null) updateBody.word_text = word_text;
    if (word_translation_uk != null) updateBody.word_translation_uk = word_translation_uk;
    if (sentence_text != null) updateBody.sentence_text = sentence_text;
    if (sentence_translation_uk != null) updateBody.sentence_translation_uk = sentence_translation_uk;

    try {
      const { data } = await axios.patch(`/words/${id}`, updateBody);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
    }
  }
);

export const deleteWord = createAsyncThunk(
  'words/deleteWord',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/words/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
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
  own: { ...listInitialState },     // my words (profile page)  
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

      .addCase(updateWord.fulfilled, (state, action) => {
        const { id, word_text, word_translation_uk, sentence_text, sentence_translation_uk } = action.payload.updatedWord;
        const word = state['own']?.items?.find(obj => Number(obj.id) === Number(id));
        if (word) {
          if (word_text != null) word.word_text = word_text;
          if (word_translation_uk != null) word.word_translation_uk = word_translation_uk;
          if (sentence_text != null) word.sentence_text = sentence_text;
          if (sentence_translation_uk != null) word.sentence_translation_uk = sentence_translation_uk;
        }
      })

      .addCase(deleteWord.fulfilled, (state, action) => {
        const deletedId = action.payload;
        if (state['own']?.items) {
          state['own'].items = state['own'].items.filter(w => w.id !== deletedId);
        }
      });
  },
});

export const wordsReducer = wordsSlice.reducer;