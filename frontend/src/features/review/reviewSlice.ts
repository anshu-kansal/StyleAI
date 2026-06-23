import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';
import { Review, ReviewState } from '../../types';

const initialState: ReviewState = {
  reviews: [],
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  loading: false,
  error: null,
  pagination: null,
  adminReviews: [],
  adminPagination: null,
};

// Async Thunks

// Fetch reviews for a specific product
export const fetchProductReviews = createAsyncThunk(
  'review/fetchProductReviews',
  async (
    {
      productId,
      params,
    }: {
      productId: string;
      params?: {
        page?: number;
        limit?: number;
        sort?: 'newest' | 'helpful' | 'ratingHigh' | 'ratingLow';
        rating?: number;
        verifiedOnly?: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(`/products/${productId}/reviews`, { params });
      return response.data.data; // contains reviews, pagination, distribution
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

// Submit (Create/Update) review with optional images
export const submitReview = createAsyncThunk(
  'review/submitReview',
  async (
    { productId, formData }: { productId: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(`/products/${productId}/reviews`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit review');
    }
  }
);

// Toggle like (helpfulness) on a review
export const toggleLikeReview = createAsyncThunk(
  'review/toggleLike',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/reviews/${reviewId}/like`);
      return { reviewId, likes: response.data.data.likes, likesCount: response.data.data.likesCount };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to like review');
    }
  }
);

// Delete a review
export const deleteReview = createAsyncThunk(
  'review/delete',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/reviews/${reviewId}`);
      return reviewId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete review');
    }
  }
);

// Admin: Fetch all reviews across the platform
export const fetchAdminReviews = createAsyncThunk(
  'review/fetchAdminReviews',
  async (
    params: { page?: number; limit?: number; status?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get('/reviews', { params });
      return response.data.data; // reviews, pagination
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin reviews');
    }
  }
);

// Admin: Moderate a review status
export const moderateReview = createAsyncThunk(
  'review/moderate',
  async (
    { reviewId, status }: { reviewId: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(`/reviews/${reviewId}/status`, { status });
      return response.data.data; // updated review
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to moderate review');
    }
  }
);

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Product Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.pagination = action.payload.pagination;
        state.distribution = action.payload.distribution;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit Review
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action: PayloadAction<Review>) => {
        state.loading = false;
        // If review is update, replace it, else push
        const index = state.reviews.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        } else {
          state.reviews.unshift(action.payload);
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle Like Review
      .addCase(toggleLikeReview.fulfilled, (state, action) => {
        const review = state.reviews.find((r) => r._id === action.payload.reviewId);
        if (review) {
          review.likes = action.payload.likes;
          review.likesCount = action.payload.likesCount;
        }
        
        // Also check in admin list
        const adminReview = state.adminReviews.find((r) => r._id === action.payload.reviewId);
        if (adminReview) {
          adminReview.likes = action.payload.likes;
          adminReview.likesCount = action.payload.likesCount;
        }
      })
      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action: PayloadAction<string>) => {
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
        state.adminReviews = state.adminReviews.filter((r) => r._id !== action.payload);
      })
      // Fetch Admin Reviews
      .addCase(fetchAdminReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.adminReviews = action.payload.reviews;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAdminReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Moderate Review
      .addCase(moderateReview.fulfilled, (state, action: PayloadAction<Review>) => {
        const index = state.adminReviews.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.adminReviews[index] = action.payload;
        }
        
        // If status is REJECTED or PENDING, filter out from active product reviews if present
        if (action.payload.status !== 'APPROVED') {
          state.reviews = state.reviews.filter((r) => r._id !== action.payload._id);
        } else {
          // If approved, verify if it belongs to current active product, and update/push
          const indexActive = state.reviews.findIndex((r) => r._id === action.payload._id);
          if (indexActive !== -1) {
            state.reviews[indexActive] = action.payload;
          }
        }
      });
  },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
