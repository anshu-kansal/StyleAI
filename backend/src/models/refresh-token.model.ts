import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  tokenHash: string;
  userId: mongoose.Types.ObjectId;
  deviceInfo?: string;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  tokenHash: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  deviceInfo: { type: String },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// TTL index for automatic token deletion
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
export default RefreshToken;
