export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum ProductGender {
  MEN = 'men',
  WOMEN = 'women',
  UNISEX = 'unisex',
  KIDS = 'kids',
}

export enum ProductSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}
