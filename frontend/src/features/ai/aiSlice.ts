import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';
import { ChatMessage, AiOutfit, AiComparison, Review, ReviewSummary, ApiResponse } from '../../types';

export interface AiState {
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  outfit: AiOutfit | null;
  outfitLoading: boolean;
  comparison: AiComparison | null;
  comparisonLoading: boolean;
  reviews: Review[];
  reviewsLoading: boolean;
  reviewSummary: ReviewSummary | null;
  reviewSummaryLoading: boolean;
  error: string | null;
}

const initialState: AiState = {
  chatMessages: [],
  chatLoading: false,
  outfit: null,
  outfitLoading: false,
  comparison: null,
  comparisonLoading: false,
  reviews: [],
  reviewsLoading: false,
  reviewSummary: null,
  reviewSummaryLoading: false,
  error: null,
};

// Async Thunks
export const chatWithAssistant = createAsyncThunk(
  'ai/chatWithAssistant',
  async (messages: ChatMessage[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/ai/chat', { messages });
      return response.data.data; // { reply, recommendations }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to chat with AI assistant');
    }
  }
);

export const generateOutfit = createAsyncThunk(
  'ai/generateOutfit',
  async (
    payload: { gender: string; occasion: string; budget: number; season: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post<ApiResponse<AiOutfit>>('/ai/outfit', payload);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate outfit');
    }
  }
);

export const compareProducts = createAsyncThunk(
  'ai/compareProducts',
  async (productIds: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<AiComparison>>('/ai/compare', { productIds });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to compare products');
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'ai/fetchProductReviews',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<Review[]>>(`/products/${productId}/reviews`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const addProductReview = createAsyncThunk(
  'ai/addProductReview',
  async (
    { productId, rating, comment }: { productId: string; rating: number; comment: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post<ApiResponse<Review>>(
        `/products/${productId}/reviews`,
        { rating, comment }
      );
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add review');
    }
  }
);

export const fetchReviewSummary = createAsyncThunk(
  'ai/fetchReviewSummary',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/products/${productId}/reviews/summary`);
      return response.data.data.summary; // Returns ReviewSummary object
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to summarize reviews');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addLocalMessage(state, action: PayloadAction<ChatMessage>) {
      state.chatMessages.push(action.payload);
    },
    clearChat(state) {
      state.chatMessages = [];
    },
    clearOutfit(state) {
      state.outfit = null;
    },
    clearComparison(state) {
      state.comparison = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // chatWithAssistant
      .addCase(chatWithAssistant.pending, (state) => {
        state.chatLoading = true;
        state.error = null;
      })
      .addCase(chatWithAssistant.fulfilled, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          role: 'assistant',
          content: action.payload.reply,
          recommendations: action.payload.recommendations || [],
        });
      })
      .addCase(chatWithAssistant.rejected, (state, action) => {
        state.chatLoading = false;
        state.error = action.payload as string;
        state.chatMessages.push({
          role: 'assistant',
          content: 'Sorry, I encountered an issue communicating with my AI brain. Please try again shortly.',
        });
      })
      // generateOutfit
      .addCase(generateOutfit.pending, (state) => {
        state.outfitLoading = true;
        state.outfit = null;
        state.error = null;
      })
      .addCase(generateOutfit.fulfilled, (state, action) => {
        state.outfitLoading = false;
        state.outfit = action.payload || null;
      })
      .addCase(generateOutfit.rejected, (state, action) => {
        state.outfitLoading = false;
        state.error = action.payload as string;
      })
      // compareProducts
      .addCase(compareProducts.pending, (state) => {
        state.comparisonLoading = true;
        state.comparison = null;
        state.error = null;
      })
      .addCase(compareProducts.fulfilled, (state, action) => {
        state.comparisonLoading = false;
        state.comparison = action.payload || null;
      })
      .addCase(compareProducts.rejected, (state, action) => {
        state.comparisonLoading = false;
        state.error = action.payload as string;
      })
      // fetchProductReviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.reviewsLoading = true;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload || [];
      })
      .addCase(fetchProductReviews.rejected, (state) => {
        state.reviewsLoading = false;
      })
      // addProductReview
      .addCase(addProductReview.fulfilled, (state, action) => {
        if (action.payload) {
          state.reviews.unshift(action.payload);
        }
      })
      // fetchReviewSummary
      .addCase(fetchReviewSummary.pending, (state) => {
        state.reviewSummaryLoading = true;
        state.reviewSummary = null;
      })
      .addCase(fetchReviewSummary.fulfilled, (state, action) => {
        state.reviewSummaryLoading = false;
        state.reviewSummary = action.payload || null;
      })
      .addCase(fetchReviewSummary.rejected, (state) => {
        state.reviewSummaryLoading = false;
      });
  },
});

export const { addLocalMessage, clearChat, clearOutfit, clearComparison } = aiSlice.actions;
export default aiSlice.reducer;
