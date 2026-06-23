import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  totals: {
    subtotal: number;
    shippingFee: number;
    estTax: number;
    discount: number;
    total: number;
  };
  couponCode?: string;
  razorpayDetails?: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true },
  size: { type: String },
  color: { type: String },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  fullName: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: 'India' },
  phone: { type: String, required: true, trim: true },
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING', index: true },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
      default: 'PENDING',
      index: true,
    },
    totals: {
      subtotal: { type: Number, required: true, min: 0 },
      shippingFee: { type: Number, required: true, min: 0 },
      estTax: { type: Number, required: true, min: 0 },
      discount: { type: Number, required: true, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    couponCode: { type: String, uppercase: true, trim: true },
    razorpayDetails: {
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
