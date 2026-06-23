export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: (slug: string) => `/product/${slug}`,
  CART: '/cart',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCTS_CREATE: '/admin/products/create',
  ADMIN_PRODUCTS_EDIT: (id: string) => `/admin/products/edit/${id}`,
  ADMIN_IMPORT: '/admin/import',
  STYLIST: '/stylist',
  AI_ASSISTANT: '/assistant',
  OUTFIT_GENERATOR: '/outfit-generator',
  COMPARE: '/compare',
} as const;

export const API_BASE_URL = '/api/v1';

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;
