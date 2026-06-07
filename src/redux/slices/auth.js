import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import axios from '../../axios';

export const fetchLogin = createAsyncThunk('auth/fetchLogin', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/auth/login', params);
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

export const fetchUserInfo = createAsyncThunk('auth/fetchUserInfo', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/userinfo');
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

export const fetchRegister = createAsyncThunk('auth/fetchRegister', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/auth/register', params);
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || 'Сервер недоступний або сталася помилка' });
  }
});

const initialState = {
  data: null,
  status: 'loading',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null;
      state.status = 'error';
      window.localStorage.removeItem('token');
    },
    setAuthStatusError: (state) => {
      state.status = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(fetchLogin.fulfilled, fetchUserInfo.fulfilled, fetchRegister.fulfilled),
        (state, action) => {
          state.data = action.payload;
          state.status = 'loaded';
        }
      )
      .addMatcher(
        isAnyOf(fetchLogin.pending, fetchUserInfo.pending, fetchRegister.pending),
        (state) => {
          state.data = null;
          state.status = 'loading';
        }
      )
      .addMatcher(
        isAnyOf(fetchLogin.rejected, fetchUserInfo.rejected, fetchRegister.rejected),
        (state) => {
          state.data = null;
          state.status = 'error';
        }
      );
  },
});

export const selectIsAuth = (state) => Boolean(state.auth.data);
export const selectUserData = (state) => state.auth.data?.userData;
export const selectAuthStatus = (state) => state.auth.status;

export const authReducer = authSlice.reducer;

export const { logout, setAuthStatusError } = authSlice.actions;

