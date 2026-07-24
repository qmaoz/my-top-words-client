import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../../axios';
import { tr } from '../../components/utils/translate';

export const fetchWords = createAsyncThunk(
  'words/fetchWords', 
  async ({ page, limit, filter }, { rejectWithValue }) => {
    let url = `/words?page=${page}&limit=${limit}`; 
    if (filter) url = url + `&filter=${filter}`;

    try {
      const { data } = await axios.get(url);
      return { ...data, filter };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  }
);

export const updateWord = createAsyncThunk('words/updateWord',
  async ({ id, word_text, sentence_text, translations }, { rejectWithValue }) => {
    const updateBody = {};
    if (word_text != null) updateBody.word_text = word_text;
    if (sentence_text != null) updateBody.sentence_text = sentence_text;
    if (translations != null) updateBody.translations = translations;

    try {
      const { data } = await axios.patch(`/words/${id}`, updateBody);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
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
  own: { ...listInitialState },
};

const wordsSlice = createSlice({
  name: 'words',
  initialState,
  extraReducers: (builder) => {
    builder
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
        const updatedWord = action.payload.updatedWord;
        const word = state['own']?.items?.find(obj => Number(obj.id) === Number(updatedWord.id));
        if (word) {
          if (updatedWord.word_text != null) word.word_text = updatedWord.word_text;
          if (updatedWord.sentence_text != null) word.sentence_text = updatedWord.sentence_text;
          if (updatedWord.translations != null) word.translations = updatedWord.translations;
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