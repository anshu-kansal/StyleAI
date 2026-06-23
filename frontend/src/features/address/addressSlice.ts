import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Address, AddressState } from '../../types';
import axiosInstance from '../../api/axios';

const initialState: AddressState = {
  items: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAddresses = createAsyncThunk(
  'address/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/addresses');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch addresses';
      return rejectWithValue(message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'address/add',
  async (addressData: Omit<Address, '_id' | 'user'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/addresses', addressData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add address';
      return rejectWithValue(message);
    }
  }
);

export const editAddress = createAsyncThunk(
  'address/edit',
  async ({ id, addressData }: { id: string; addressData: Partial<Address> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/addresses/${id}`, addressData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update address';
      return rejectWithValue(message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/addresses/${id}`);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete address';
      return rejectWithValue(message);
    }
  }
);

export const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Address
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        state.loading = false;
        const newAddress = action.payload;
        if (newAddress.isDefault) {
          state.items = state.items.map((item) => ({ ...item, isDefault: false }));
        }
        state.items.unshift(newAddress);
        // Sort to place default address at the top
        state.items.sort((a, b) => (a.isDefault ? -1 : 1) - (b.isDefault ? -1 : 1));
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Edit Address
      .addCase(editAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        state.loading = false;
        const updatedAddress = action.payload;
        if (updatedAddress.isDefault) {
          state.items = state.items.map((item) =>
            item._id === updatedAddress._id ? updatedAddress : { ...item, isDefault: false }
          );
        } else {
          state.items = state.items.map((item) =>
            item._id === updatedAddress._id ? updatedAddress : item
          );
        }
        state.items.sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : 0));
      })
      .addCase(editAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        const deletedId = action.payload;
        const wasDefault = state.items.find((item) => item._id === deletedId)?.isDefault;
        state.items = state.items.filter((item) => item._id !== deletedId);
        
        // Promote next address to default if default was deleted and other items exist
        if (wasDefault && state.items.length > 0) {
          state.items[0] = { ...state.items[0], isDefault: true };
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;
