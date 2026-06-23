import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
  question: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  isBestAnswer: boolean;
  userRole: 'USER' | 'ADMIN' | 'SELLER';
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
    },
    likes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    likesCount: { type: Number, default: 0 },
    isBestAnswer: { type: Boolean, default: false },
    userRole: {
      type: String,
      enum: ['USER', 'ADMIN', 'SELLER'],
      default: 'USER',
    },
  },
  {
    timestamps: true,
  }
);

// Index to load top answers inside questions fast (best answers first, then upvotes count, then newest)
answerSchema.index({ question: 1, status: 1, isBestAnswer: -1, likesCount: -1, createdAt: -1 });
answerSchema.index({ user: 1 });

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema);
export default Answer;
