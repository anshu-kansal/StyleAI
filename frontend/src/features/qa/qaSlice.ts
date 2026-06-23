import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';
import { Question, Answer, QaState } from '../../types';

const initialState: QaState = {
  questions: [],
  pagination: null,
  answers: {},
  answersPagination: {},
  loading: false,
  answersLoading: {},
  error: null,
};

// Async Thunks

// Fetch product questions list (with top answers pre-hydrated)
export const fetchProductQuestions = createAsyncThunk(
  'qa/fetchQuestions',
  async (
    {
      productId,
      params,
    }: {
      productId: string;
      params?: { page?: number; limit?: number; search?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(`/qa/products/${productId}/questions`, { params });
      return response.data.data; // questions, pagination
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch questions');
    }
  }
);

// Submit a new question
export const submitQuestion = createAsyncThunk(
  'qa/submitQuestion',
  async (
    { productId, content }: { productId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(`/qa/products/${productId}/questions`, { content });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit question');
    }
  }
);

// Delete a question
export const deleteQuestion = createAsyncThunk(
  'qa/deleteQuestion',
  async (questionId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/qa/questions/${questionId}`);
      return questionId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete question');
    }
  }
);

// Fetch answers for a question (paginated)
export const fetchQuestionAnswers = createAsyncThunk(
  'qa/fetchAnswers',
  async (
    {
      questionId,
      params,
    }: {
      questionId: string;
      params?: { page?: number; limit?: number };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(`/qa/questions/${questionId}/answers`, { params });
      return { questionId, data: response.data.data }; // answers, pagination
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch answers');
    }
  }
);

// Submit an answer
export const submitAnswer = createAsyncThunk(
  'qa/submitAnswer',
  async (
    { questionId, content }: { questionId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(`/qa/questions/${questionId}/answers`, { content });
      return response.data.data; // answer
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit answer');
    }
  }
);

// Delete an answer
export const deleteAnswer = createAsyncThunk(
  'qa/deleteAnswer',
  async (
    { answerId, questionId }: { answerId: string; questionId: string },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.delete(`/qa/answers/${answerId}`);
      return { answerId, questionId };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete answer');
    }
  }
);

// Toggle upvote / like on an answer
export const toggleLikeAnswer = createAsyncThunk(
  'qa/toggleLikeAnswer',
  async (
    { answerId, questionId }: { answerId: string; questionId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(`/qa/answers/${answerId}/like`);
      return {
        answerId,
        questionId,
        likes: response.data.data.likes,
        likesCount: response.data.data.likesCount,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to upvote answer');
    }
  }
);

// Toggle "Best Answer" flag on an answer
export const toggleBestAnswer = createAsyncThunk(
  'qa/toggleBestAnswer',
  async (
    { answerId, questionId }: { answerId: string; questionId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(`/qa/answers/${answerId}/best`);
      return response.data.data; // updated answer
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle best answer status');
    }
  }
);

export const qaSlice = createSlice({
  name: 'qa',
  initialState,
  reducers: {
    clearQaError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Product Questions
      .addCase(fetchProductQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductQuestions.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.questions = action.payload.questions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProductQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit Question
      .addCase(submitQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
        state.questions.unshift(action.payload);
      })
      // Delete Question
      .addCase(deleteQuestion.fulfilled, (state, action: PayloadAction<string>) => {
        state.questions = state.questions.filter((q) => q._id !== action.payload);
        delete state.answers[action.payload];
        delete state.answersPagination[action.payload];
      })
      // Fetch Question Answers
      .addCase(fetchQuestionAnswers.pending, (state, action) => {
        const questionId = action.meta.arg.questionId;
        state.answersLoading[questionId] = true;
      })
      .addCase(fetchQuestionAnswers.fulfilled, (state, action: PayloadAction<{ questionId: string; data: any }>) => {
        const { questionId, data } = action.payload;
        state.answersLoading[questionId] = false;
        state.answers[questionId] = data.answers;
        state.answersPagination[questionId] = data.pagination;

        // Also update topAnswer inside questions list if matched
        const question = state.questions.find((q) => q._id === questionId);
        if (question && data.answers.length > 0) {
          question.topAnswer = data.answers[0];
        }
      })
      .addCase(fetchQuestionAnswers.rejected, (state, action) => {
        const questionId = action.meta.arg.questionId;
        state.answersLoading[questionId] = false;
        state.error = action.payload as string;
      })
      // Submit Answer
      .addCase(submitAnswer.fulfilled, (state, action: PayloadAction<Answer>) => {
        const qId = action.payload.question;
        
        if (!state.answers[qId]) {
          state.answers[qId] = [];
        }
        
        // Push or update answer
        const index = state.answers[qId].findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.answers[qId][index] = action.payload;
        } else {
          state.answers[qId].push(action.payload);
        }

        // Increment answersCount in the question item
        const question = state.questions.find((q) => q._id === qId);
        if (question) {
          question.answersCount += 1;
          // Set as topAnswer if none exists
          if (!question.topAnswer) {
            question.topAnswer = action.payload;
          }
        }
      })
      // Delete Answer
      .addCase(deleteAnswer.fulfilled, (state, action: PayloadAction<{ answerId: string; questionId: string }>) => {
        const { answerId, questionId } = action.payload;
        if (state.answers[questionId]) {
          state.answers[questionId] = state.answers[questionId].filter((a) => a._id !== answerId);
        }
        
        const question = state.questions.find((q) => q._id === questionId);
        if (question) {
          question.answersCount = Math.max(0, question.answersCount - 1);
          // If deleted answer was topAnswer, re-evaluate
          if (question.topAnswer?._id === answerId) {
            question.topAnswer = state.answers[questionId]?.[0] || null;
          }
        }
      })
      // Toggle Like Answer
      .addCase(toggleLikeAnswer.fulfilled, (state, action) => {
        const { answerId, questionId, likes, likesCount } = action.payload;
        
        if (state.answers[questionId]) {
          const answer = state.answers[questionId].find((a) => a._id === answerId);
          if (answer) {
            answer.likes = likes;
            answer.likesCount = likesCount;
          }
        }

        const question = state.questions.find((q) => q._id === questionId);
        if (question && question.topAnswer?._id === answerId) {
          question.topAnswer.likes = likes;
          question.topAnswer.likesCount = likesCount;
        }
      })
      // Toggle Best Answer
      .addCase(toggleBestAnswer.fulfilled, (state, action: PayloadAction<Answer>) => {
        const qId = action.payload.question.toString();
        const ansId = action.payload._id;
        
        if (state.answers[qId]) {
          state.answers[qId] = state.answers[qId].map((a) => {
            if (a._id === ansId) {
              return action.payload;
            } else if (action.payload.isBestAnswer) {
              // If we marked a new best answer, unmark other best answers
              return { ...a, isBestAnswer: false };
            }
            return a;
          });
          
          // Re-sort answers so best answer is on top
          state.answers[qId].sort((a, b) => (a.isBestAnswer ? -1 : b.isBestAnswer ? 1 : 0) - (a.likesCount - b.likesCount));
        }

        const question = state.questions.find((q) => q._id === qId);
        if (question) {
          if (action.payload.isBestAnswer) {
            question.topAnswer = action.payload;
          } else if (question.topAnswer?._id === ansId) {
            // Updated best answer status
            question.topAnswer = action.payload;
          }
        }
      });
  },
});

export const { clearQaError } = qaSlice.actions;
export default qaSlice.reducer;
