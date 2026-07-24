import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import axios from '../../axios';
import { tr } from '../../components/utils/translate';

export const fetchLogin = createAsyncThunk('auth/fetchLogin', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/auth/login', params);
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
  }
});

export const fetchUserInfo = createAsyncThunk('auth/fetchUserInfo', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/userinfo');
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
  }
});

export const fetchRegister = createAsyncThunk('auth/fetchRegister', async ({ username, password }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/auth/register', { username, password });
    return data;
  } catch (error) {
    return rejectWithValue({ message: error?.response?.data || tr('common.serverError') });
  }
});

export const updateUserPreferences = createAsyncThunk(
  'auth/updateUserPreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch('/user/preferences', preferences);
      return data;
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data || tr('profile.settingsSaveError') });
    }
  }
);

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
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        if (state.data?.userData) {
          state.data.userData.preferred_translation_locale = action.payload.preferred_translation_locale;
          state.data.userData.ui_locale = action.payload.ui_locale;
        }
      })
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
export const selectPreferredTranslationLocale = (state) => state.auth.data?.userData?.preferred_translation_locale;
export const selectUiLocale = (state) => state.auth.data?.userData?.ui_locale;
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsAdmin = (state) => Boolean(state.auth.data?.userData?.is_admin);

export const authReducer = authSlice.reducer;

export const { logout, setAuthStatusError } = authSlice.actions;

