import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';
import { Product, Category, Brand, PaginatedResponse, ApiResponse } from '../../types';

export interface CatalogFilters {
  category: string;
  brand: string;
  gender: string;
  size: string;
  minPrice: number | '';
  maxPrice: number | '';
  keyword: string;
}

export interface CatalogState {
  products: Product[];
  product: Product | null;
  relatedProducts: Product[];
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  categoriesLoading: boolean;
  brandsLoading: boolean;
  error: string | null;
  filters: CatalogFilters;
  sort: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialFilters: CatalogFilters = {
  category: '',
  brand: '',
  gender: '',
  size: '',
  minPrice: '',
  maxPrice: '',
  keyword: '',
};

const initialState: CatalogState = {
  products: [],
  product: null,
  relatedProducts: [],
  categories: [],
  brands: [],
  loading: false,
  categoriesLoading: false,
  brandsLoading: false,
  error: null,
  filters: initialFilters,
  sort: 'newest',
  pagination: {
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
  },
};

// Async Thunks
export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { catalog: CatalogState };
      const { filters, sort, pagination } = state.catalog;
      
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (sort) params.sort = sort;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.gender) params.gender = filters.gender;
      if (filters.size) params.size = filters.size;
      if (filters.minPrice !== '') params.minPrice = filters.minPrice;
      if (filters.maxPrice !== '') params.maxPrice = filters.maxPrice;
      if (filters.keyword) params.keyword = filters.keyword;

      const response = await axiosInstance.get<PaginatedResponse<Product>>('/products', { params });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'catalog/fetchProductBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<Product>>(`/products/${slug}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch product details');
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'catalog/fetchRelatedProducts',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<Product[]>>(`/products/${id}/related`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch related products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'catalog/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<Category[]>>('/categories');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchBrands = createAsyncThunk(
  'catalog/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<Brand[]>>('/brands');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch brands');
    }
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<{ key: keyof CatalogFilters; value: any }>) {
      const { key, value } = action.payload;
      state.filters[key] = value as never;
      state.pagination.page = 1; // Reset to page 1 on filter change
    },
    resetFilters(state) {
      state.filters = initialFilters;
      state.pagination.page = 1;
    },
    setSort(state, action: PayloadAction<string>) {
      state.sort = action.payload;
      state.pagination.page = 1;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.filters.keyword = action.payload;
      state.pagination.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<PaginatedResponse<Product>>) => {
        state.loading = false;
        state.products = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.total = action.payload.meta.total;
          state.pagination.page = action.payload.meta.page;
          state.pagination.limit = action.payload.meta.limit;
          state.pagination.totalPages = action.payload.meta.totalPages;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchProductBySlug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.product = null;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action: PayloadAction<Product | undefined>) => {
        state.loading = false;
        state.product = action.payload || null;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchRelatedProducts
      .addCase(fetchRelatedProducts.fulfilled, (state, action: PayloadAction<Product[] | undefined>) => {
        state.relatedProducts = action.payload || [];
      })
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[] | undefined>) => {
        state.categoriesLoading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesLoading = false;
      })
      // fetchBrands
      .addCase(fetchBrands.pending, (state) => {
        state.brandsLoading = true;
      })
      .addCase(fetchBrands.fulfilled, (state, action: PayloadAction<Brand[] | undefined>) => {
        state.brandsLoading = false;
        state.brands = action.payload || [];
      })
      .addCase(fetchBrands.rejected, (state) => {
        state.brandsLoading = false;
      });
  },
});

export const { setFilter, resetFilters, setSort, setSearch, setPage } = catalogSlice.actions;
export default catalogSlice.reducer;
