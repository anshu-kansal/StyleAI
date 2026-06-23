import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  answersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
    },
    answersCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes for pagination and sorting
questionSchema.index({ product: 1, status: 1, createdAt: -1 });
questionSchema.index({ user: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
export default Question;
