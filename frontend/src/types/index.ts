export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password?: string;
  roles?: string[];
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Variant {
  sku: string;
  size?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  _id?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: Brand;
  category: Category;
  gender: string;
  images: string[];
  variants: Variant[];
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  savedItems: CartItem[];
  loading: boolean;
  error: string | null;
}

export interface WishlistState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

export interface Address {
  _id: string;
  user: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressState {
  items: Address[];
  loading: boolean;
  error: string | null;
}

export interface OrderItem {
  product: string;
  name: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: Omit<Address, '_id' | 'user' | 'isDefault'>;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  totals: {
    subtotal: number;
    shippingFee: number;
    estTax: number;
    total: number;
  };
  razorpayDetails?: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export interface StylistInput {
  occasion: string;
  gender: string;
  budget: number;
  aesthetic?: string;
}

export interface StylistResponseData {
  advice: string;
  products: Product[];
}

export interface StylistState {
  advice: string | null;
  products: Product[];
  loading: boolean;
  error: string | null;
}export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  images: string[];
  likes: string[];
  likesCount: number;
  isVerifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewState {
  reviews: Review[];
  distribution: Record<number, number>;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  adminReviews: Review[];
  adminPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

export interface ReviewSummary {
  summary: string;
  pros: string[];
  cons: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Product[];
}

export interface AiOutfit {
  concept: string;
  colorPalette: string[];
  outfitDescription: string;
  items: {
    category: string;
    styleDetails: string;
    approxPrice: number;
  }[];
  products: Product[];
}

export interface AiComparison {
  comparisonTable: {
    criterion: string;
    value1: string;
    value2: string;
  }[];
  pros: Record<string, string[]>;
  cons: Record<string, string[]>;
  verdict: string;
}

export interface Answer {
  _id: string;
  question: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  likes: string[];
  likesCount: number;
  isBestAnswer: boolean;
  userRole: 'USER' | 'ADMIN' | 'SELLER';
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  answersCount: number;
  topAnswer: Answer | null;
  createdAt: string;
  updatedAt: string;
}

export interface QaState {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  answers: Record<string, Answer[]>;
  answersPagination: Record<string, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>;
  loading: boolean;
  answersLoading: Record<string, boolean>;
  error: string | null;
}

