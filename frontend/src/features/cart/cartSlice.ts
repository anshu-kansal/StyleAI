import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '../../types';

const loadCartFromStorage = (): { items: CartItem[]; savedItems: CartItem[] } => {
  try {
    const serialized = localStorage.getItem('styleai_cart');
    if (serialized) {
      const data = JSON.parse(serialized);
      return {
        items: Array.isArray(data.items) ? data.items : [],
        savedItems: Array.isArray(data.savedItems) ? data.savedItems : [],
      };
    }
  } catch (err) {
    console.error('Failed to load cart from localStorage:', err);
  }
  return { items: [], savedItems: [] };
};

const saveCartToStorage = (items: CartItem[], savedItems: CartItem[]) => {
  try {
    localStorage.setItem('styleai_cart', JSON.stringify({ items, savedItems }));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
};

const savedState = loadCartFromStorage();

const initialState: CartState = {
  items: savedState.items,
  savedItems: savedState.savedItems,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const newItem = action.payload;
      
      // Remove from savedItems if it was saved for later
      state.savedItems = state.savedItems.filter((item) => item.sku !== newItem.sku);

      // Check if item variant SKU is already in cart
      const existingItem = state.items.find((item) => item.sku === newItem.sku);
      if (existingItem) {
        // Increment quantity, capped by available stock
        existingItem.quantity = Math.min(existingItem.quantity + newItem.quantity, existingItem.stock);
      } else {
        state.items.push(newItem);
      }

      saveCartToStorage(state.items, state.savedItems);
    },
    
    removeFromCart(state, action: PayloadAction<string>) {
      const sku = action.payload;
      state.items = state.items.filter((item) => item.sku !== sku);
      saveCartToStorage(state.items, state.savedItems);
    },

    updateQuantity(state, action: PayloadAction<{ sku: string; quantity: number }>) {
      const { sku, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.sku === sku);
      
      if (existingItem) {
        existingItem.quantity = Math.max(1, Math.min(quantity, existingItem.stock));
      }
      
      saveCartToStorage(state.items, state.savedItems);
    },

    saveForLater(state, action: PayloadAction<string>) {
      const sku = action.payload;
      const targetItem = state.items.find((item) => item.sku === sku);
      
      if (targetItem) {
        // Remove from items
        state.items = state.items.filter((item) => item.sku !== sku);
        
        // Add to savedItems if not already present
        const alreadySaved = state.savedItems.some((item) => item.sku === sku);
        if (!alreadySaved) {
          state.savedItems.push(targetItem);
        }
      }
      
      saveCartToStorage(state.items, state.savedItems);
    },

    moveToCart(state, action: PayloadAction<string>) {
      const sku = action.payload;
      const targetItem = state.savedItems.find((item) => item.sku === sku);
      
      if (targetItem) {
        // Remove from savedItems
        state.savedItems = state.savedItems.filter((item) => item.sku !== sku);
        
        // Add back to items
        const existingItem = state.items.find((item) => item.sku === sku);
        if (existingItem) {
          existingItem.quantity = Math.min(existingItem.quantity + 1, existingItem.stock);
        } else {
          state.items.push({ ...targetItem, quantity: 1 });
        }
      }
      
      saveCartToStorage(state.items, state.savedItems);
    },

    removeFromSaved(state, action: PayloadAction<string>) {
      const sku = action.payload;
      state.savedItems = state.savedItems.filter((item) => item.sku !== sku);
      saveCartToStorage(state.items, state.savedItems);
    },

    clearCart(state) {
      state.items = [];
      saveCartToStorage(state.items, state.savedItems);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  saveForLater,
  moveToCart,
  removeFromSaved,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
