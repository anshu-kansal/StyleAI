import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginInput, RegisterInput } from '../../types';
import axiosInstance from '../../api/axios';
import { LOCAL_STORAGE_KEYS } from '../../constants';

// Restore initial state from localStorage if available
const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
};

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterInput, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginInput, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const { token, user } = response.data.data;
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      return { token, user };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Proceed with local logout anyway
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      dispatch(logout());
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/refresh');
      const { token, user } = response.data.data;
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      return { token, user };
    } catch (error: any) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      const message = error.response?.data?.message || 'Session expired';
      return rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;
