import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StylistState, StylistInput, StylistResponseData, ApiResponse } from '../../types';
import axiosInstance from '../../api/axios';

const initialState: StylistState = {
  advice: null,
  products: [],
  loading: false,
  error: null,
};

export const getStylistRecommendations = createAsyncThunk(
  'stylist/getRecommendations',
  async (inputData: StylistInput, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<StylistResponseData>>('/stylist', inputData);
      return response.data.data!;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get styling suggestions';
      return rejectWithValue(message);
    }
  }
);

export const stylistSlice = createSlice({
  name: 'stylist',
  initialState,
  reducers: {
    clearStylistState: (state) => {
      state.advice = null;
      state.products = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStylistRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStylistRecommendations.fulfilled, (state, action: PayloadAction<StylistResponseData>) => {
        state.loading = false;
        state.advice = action.payload.advice;
        state.products = action.payload.products;
      })
      .addCase(getStylistRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStylistState } = stylistSlice.actions;
export default stylistSlice.reducer;
