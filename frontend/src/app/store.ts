import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from '../features/auth/authSlice';
import catalogReducer from '../features/catalog/catalogSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import addressReducer from '../features/address/addressSlice';
import orderReducer from '../features/order/orderSlice';
import stylistReducer from '../features/stylist/stylistSlice';
import aiReducer from '../features/ai/aiSlice';
import adminReducer from '../features/admin/adminSlice';
import reviewReducer from '../features/review/reviewSlice';
import qaReducer from '../features/qa/qaSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    address: addressReducer,
    order: orderReducer,
    stylist: stylistReducer,
    ai: aiReducer,
    admin: adminReducer,
    review: reviewReducer,
    qa: qaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom typed hooks to use instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
