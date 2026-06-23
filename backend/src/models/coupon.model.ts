import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  applicableCategories: mongoose.Types.ObjectId[];
  applicableProducts: mongoose.Types.ObjectId[];
  firstTimeOnly: boolean;
  usageLimitPerUser: number;
  userRestrictions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    applicableCategories: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      default: [],
    },
    applicableProducts: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
      default: [],
    },
    firstTimeOnly: { type: Boolean, default: false },
    usageLimitPerUser: { type: Number, default: 0 },
    userRestrictions: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
export default Coupon;
