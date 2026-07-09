import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';
import { logout } from './auth';

export const submitFeedback = createAsyncThunk('admin/submitFeedback', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/feedback', params);
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

export const fetchAdminOverview = createAsyncThunk('admin/fetchOverview', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/admin/overview');
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

export const fetchAdminFeedback = createAsyncThunk('admin/fetchFeedback', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/admin/feedback', { params });
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

export const updateAdminFeedback = createAsyncThunk('admin/updateFeedback', async ({ id, ...body }, { rejectWithValue }) => {
  try {
    const { data } = await axios.patch(`/admin/feedback/${id}`, body);
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/admin/users', { params });
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

export const deleteAdminUser = createAsyncThunk('admin/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await axios.delete(`/admin/users/${userId}`);
    return { userId, ...data };
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

const initialState = {
  overview: null,
  overviewStatus: 'idle',
  feedback: { items: [], totalPages: 0, currentPage: 1, totalItems: 0, status: 'idle' },
  users: { items: [], totalPages: 0, currentPage: 1, totalItems: 0, status: 'idle' },
  submitStatus: 'idle',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetSubmitStatus: (state) => {
      state.submitStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFeedback.pending, (state) => {
        state.submitStatus = 'loading';
      })
      .addCase(submitFeedback.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
      })
      .addCase(submitFeedback.rejected, (state) => {
        state.submitStatus = 'failed';
      })
      .addCase(fetchAdminOverview.pending, (state) => {
        state.overviewStatus = 'loading';
      })
      .addCase(fetchAdminOverview.fulfilled, (state, action) => {
        state.overview = action.payload;
        state.overviewStatus = 'loaded';
      })
      .addCase(fetchAdminOverview.rejected, (state) => {
        state.overviewStatus = 'error';
      })
      .addCase(fetchAdminFeedback.pending, (state) => {
        state.feedback.status = 'loading';
      })
      .addCase(fetchAdminFeedback.fulfilled, (state, action) => {
        state.feedback = {
          ...state.feedback,
          ...action.payload,
          status: 'loaded',
        };
      })
      .addCase(fetchAdminFeedback.rejected, (state) => {
        state.feedback.status = 'error';
      })
      .addCase(updateAdminFeedback.fulfilled, (state, action) => {
        const index = state.feedback.items.findIndex((item) => item.id === action.payload.item.id);
        if (index !== -1) {
          state.feedback.items[index] = action.payload.item;
        }
      })
      .addCase(fetchAdminUsers.pending, (state) => {
        state.users.status = 'loading';
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = {
          ...state.users,
          ...action.payload,
          status: 'loaded',
        };
      })
      .addCase(fetchAdminUsers.rejected, (state) => {
        state.users.status = 'error';
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.users.items = state.users.items.filter((user) => user.id !== action.payload.userId);
        state.users.totalItems = Math.max(0, state.users.totalItems - 1);
      })
      .addCase(logout, () => initialState);
  },
});

export const { resetSubmitStatus } = adminSlice.actions;
export const adminReducer = adminSlice.reducer;
