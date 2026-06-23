import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, WishlistState } from '../../types';

const loadWishlistFromStorage = (): Product[] => {
  try {
    const serialized = localStorage.getItem('styleai_wishlist');
    if (serialized) {
      const data = JSON.parse(serialized);
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Failed to load wishlist from localStorage:', err);
  }
  return [];
};

const saveWishlistToStorage = (items: Product[]) => {
  try {
    localStorage.setItem('styleai_wishlist', JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save wishlist to localStorage:', err);
  }
};

const initialState: WishlistState = {
  items: loadWishlistFromStorage(),
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<Product>) {
      const product = action.payload;
      const exists = state.items.some((item) => item._id === product._id);
      
      if (exists) {
        state.items = state.items.filter((item) => item._id !== product._id);
      } else {
        state.items.push(product);
      }
      
      saveWishlistToStorage(state.items);
    },

    removeFromWishlist(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.items = state.items.filter((item) => item._id !== id);
      saveWishlistToStorage(state.items);
    },
  },
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
