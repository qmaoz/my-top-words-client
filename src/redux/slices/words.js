import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../../api/axios';
import { tr } from '../../utils/translate';

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

const wordsSlice = createSlice({
  name: 'words',
  initialState: {},
  reducers: {},
});

export const wordsReducer = wordsSlice.reducer;
