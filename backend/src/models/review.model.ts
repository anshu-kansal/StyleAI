import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  isVerifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    likes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    likesCount: { type: Number, default: 0 },
    isVerifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for pagination and sorting
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ product: 1, status: 1, likesCount: -1 });
reviewSchema.index({ user: 1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
