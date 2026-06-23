import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../constants/enums';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  resetPasswordTokenHash?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.USER],
    },
    resetPasswordTokenHash: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
