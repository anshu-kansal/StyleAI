import mongoose, { Schema } from 'mongoose';
import { ProductGender, ProductSize } from '../constants/enums';

export interface IVariant {
  sku: string;
  size?: ProductSize;
  color?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
}

export interface IProduct extends mongoose.Document {
  name: string;
  slug: string;
  description: string;
  brand: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  gender: ProductGender;
  images: string[];
  variants: IVariant[];
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IVariant>({
  sku: { type: String, required: true, trim: true },
  size: { type: String, enum: Object.values(ProductSize) },
  color: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: { type: [String], default: [] },
});

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    gender: {
      type: String,
      enum: Object.values(ProductGender),
      required: true,
      index: true,
    },
    images: { type: [String], default: [] },
    variants: { type: [variantSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
productSchema.index({ name: 'text', description: 'text' }, { weights: { name: 10, description: 5 } });
productSchema.index({ isActive: 1, category: 1, gender: 1, createdAt: -1 });
productSchema.index({ isActive: 1, brand: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 });


// Pre-validate hook to generate slug if not provided
productSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
