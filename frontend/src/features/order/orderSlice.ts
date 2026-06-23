import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderState } from '../../types';
import axiosInstance from '../../api/axios';

const initialState: OrderState = {
  currentOrder: null,
  orders: [],
  loading: false,
  error: null,
};

// Async Thunks
export const placeCODOrder = createAsyncThunk(
  'order/placeCOD',
  async (
    payload: { addressId: string; items: { productId: string; sku: string; quantity: number }[]; couponCode?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post('/orders/cod', payload);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to place order';
      return rejectWithValue(message);
    }
  }
);

export const createRazorpayOrder = createAsyncThunk(
  'order/createRazorpay',
  async (
    payload: { addressId: string; items: { productId: string; sku: string; quantity: number }[]; couponCode?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post('/orders/razorpay', payload);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to initiate payment';
      return rejectWithValue(message);
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  'order/verifyRazorpay',
  async (
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      addressId: string;
      items: { productId: string; sku: string; quantity: number }[];
      couponCode?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post('/orders/verify', payload);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Payment verification failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/orders/my-orders');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch order details';
      return rejectWithValue(message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/orders/${orderId}/cancel`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      return rejectWithValue(message);
    }
  }
);

export const requestReturn = createAsyncThunk(
  'order/requestReturn',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/orders/${orderId}/return`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to request return';
      return rejectWithValue(message);
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/orders');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch customer orders';
      return rejectWithValue(message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async (
    payload: { orderId: string; orderStatus: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(`/orders/${payload.orderId}/status`, {
        orderStatus: payload.orderStatus,
      });
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update order status';
      return rejectWithValue(message);
    }
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderState: (state) => {
      state.currentOrder = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // COD Order
      .addCase(placeCODOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeCODOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(placeCODOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Razorpay Order Creation (loading state only)
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Payment Verification
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchMyOrders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // cancelOrder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders = state.orders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // requestReturn
      .addCase(requestReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestReturn.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders = state.orders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      })
      .addCase(requestReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchAllOrders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateOrderStatus
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders = state.orders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
