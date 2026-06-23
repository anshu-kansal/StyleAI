import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to generate slug if not provided
brandSchema.pre('validate', function (next) {
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

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
export default Brand;
