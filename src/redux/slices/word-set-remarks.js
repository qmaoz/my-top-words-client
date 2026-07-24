import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';
import { tr } from '../../components/utils/translate';

export const submitWordSetRemark = createAsyncThunk(
  'wordSetRemarks/submit',
  async ({ wordSetId, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/word-sets/${wordSetId}/remarks`, body);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  },
);

export const fetchMyWordSetRemarks = createAsyncThunk(
  'wordSetRemarks/fetchMine',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/me/word-set-remarks', { params });
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  },
);

export const fetchWordSetRemarks = createAsyncThunk(
  'wordSetRemarks/fetchForSet',
  async ({ wordSetId, ...params }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/word-sets/${wordSetId}/remarks`, { params });
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  },
);

export const updateWordSetRemark = createAsyncThunk(
  'wordSetRemarks/update',
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/word-set-remarks/${id}`, body);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
    }
  },
);

const listState = { items: [], totalPages: 0, currentPage: 1, totalItems: 0, status: 'idle' };

const initialState = {
  inbox: { ...listState },
  forSet: { ...listState, wordSetId: null },
  queuedTotal: 0,
};

const removeFromList = (list, id) => {
  const nextItems = list.items.filter((item) => Number(item.id) !== Number(id));
  if (nextItems.length === list.items.length) return;
  list.items = nextItems;
  list.totalItems = Math.max(0, (list.totalItems || 0) - 1);
};

const wordSetRemarksSlice = createSlice({
  name: 'wordSetRemarks',
  initialState,
  reducers: {
    clearWordSetRemarks: () => ({ ...initialState, inbox: { ...listState }, forSet: { ...listState, wordSetId: null } }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyWordSetRemarks.pending, (state) => {
        state.inbox.status = 'loading';
      })
      .addCase(fetchMyWordSetRemarks.fulfilled, (state, action) => {
        state.inbox = {
          items: action.payload.items ?? [],
          totalPages: action.payload.totalPages ?? 0,
          currentPage: action.payload.currentPage ?? 1,
          totalItems: action.payload.totalItems ?? 0,
          status: 'loaded',
        };
        if (action.meta.arg?.status === 'queued') {
          state.queuedTotal = action.payload.totalItems ?? 0;
        }
      })
      .addCase(fetchMyWordSetRemarks.rejected, (state) => {
        state.inbox.status = 'error';
      })
      .addCase(fetchWordSetRemarks.pending, (state) => {
        state.forSet.status = 'loading';
      })
      .addCase(fetchWordSetRemarks.fulfilled, (state, action) => {
        state.forSet = {
          wordSetId: action.meta.arg.wordSetId,
          items: action.payload.items ?? [],
          totalPages: action.payload.totalPages ?? 0,
          currentPage: action.payload.currentPage ?? 1,
          totalItems: action.payload.totalItems ?? 0,
          status: 'loaded',
        };
      })
      .addCase(fetchWordSetRemarks.rejected, (state) => {
        state.forSet.status = 'error';
      })
      .addCase(updateWordSetRemark.fulfilled, (state, action) => {
        const updated = action.payload?.item;
        if (!updated) return;

        if (updated.status === 'done') {
          removeFromList(state.inbox, updated.id);
          removeFromList(state.forSet, updated.id);
          state.queuedTotal = Math.max(0, state.queuedTotal - 1);
          return;
        }

        const patchList = (list) => {
          const index = list.items.findIndex((item) => Number(item.id) === Number(updated.id));
          if (index >= 0) list.items[index] = updated;
        };

        patchList(state.inbox);
        patchList(state.forSet);
      });
  },
});

export const { clearWordSetRemarks } = wordSetRemarksSlice.actions;
export const selectQueuedRemarksTotal = (state) => state.wordSetRemarks.queuedTotal;
export const wordSetRemarksReducer = wordSetRemarksSlice.reducer;
