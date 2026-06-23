import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';
import { ApiResponse, Order } from '../../types';

// ─── Types ───────────────────────────────────────────────────────────
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyRevenue {
  _id: { year: number; month: number };
  revenue: number;
  count: number;
}

export interface OrderStatusDist {
  _id: string;
  count: number;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  firstTimeOnly?: boolean;
  usageLimitPerUser?: number;
  userRestrictions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeCoupons: number;
  monthlyRevenue: MonthlyRevenue[];
  orderStatusDist: OrderStatusDist[];
  recentOrders: Order[];
}

export interface AdminState {
  stats: DashboardStats | null;
  statsLoading: boolean;
  users: AdminUser[];
  usersLoading: boolean;
  allOrders: Order[];
  allOrdersLoading: boolean;
  coupons: Coupon[];
  couponsLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  statsLoading: false,
  users: [],
  usersLoading: false,
  allOrders: [],
  allOrdersLoading: false,
  coupons: [],
  couponsLoading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<ApiResponse<DashboardStats>>('/admin/stats');
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<ApiResponse<AdminUser[]>>('/admin/users');
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, roles }: { userId: string; roles: string[] }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/role`, { roles });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update user role');
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  'admin/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<ApiResponse<Order[]>>('/orders');
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, orderStatus }: { orderId: string; orderStatus: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { orderStatus });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const fetchCoupons = createAsyncThunk(
  'admin/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<ApiResponse<Coupon[]>>('/coupons');
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

export const createCoupon = createAsyncThunk(
  'admin/createCoupon',
  async (data: Partial<Coupon>, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post<ApiResponse<Coupon>>('/coupons', data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create coupon');
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'admin/deleteCoupon',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/coupons/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete coupon');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload || null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      })
      // Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.users.findIndex((u) => u._id === action.payload!._id);
          if (idx !== -1) state.users[idx] = action.payload;
        }
      })
      // All Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.allOrdersLoading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.allOrdersLoading = false;
        state.allOrders = action.payload || [];
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.allOrdersLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.allOrders.findIndex((o) => o._id === action.payload!._id);
          if (idx !== -1) state.allOrders[idx] = action.payload;
        }
      })
      // Coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.couponsLoading = true;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.couponsLoading = false;
        state.coupons = action.payload || [];
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.couponsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        if (action.payload) state.coupons.unshift(action.payload);
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
