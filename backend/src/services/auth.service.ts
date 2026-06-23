import User from '../models/user.model';
import RefreshToken from '../models/refresh-token.model';
import { ApiError } from '../utils/api-error';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
} from '../utils/jwt.util';
import { config } from '../config/app.config';
import crypto from 'crypto';
import { logger } from '../utils/logger';

// Helper to parse duration string (e.g. "7d", "15m", "1h") to milliseconds
export const parseDuration = (duration: string): number => {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);
  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return value;
  }
};

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    roles?: string[];
  }) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw ApiError.conflict('Email is already registered');
    }

    const newUser = new User({
      name: userData.name,
      email: userData.email,
      passwordHash: userData.password, // hashed in pre-save hook
      roles: userData.roles,
    });

    await newUser.save();

    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      roles: newUser.roles,
    };
  }

  /**
   * Log in user
   */
  static async login(
    credentials: { email: string; password: string },
    deviceInfo?: string
  ) {
    const user = await User.findOne({ email: credentials.email });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(credentials.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const payload = {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles,
      name: user.name,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = generateRefreshToken();

    // Save hashed refresh token to DB
    const tokenHash = hashToken(refreshToken);
    const refreshExpiryMs = parseDuration(config.jwt.refreshExpiration);
    const expiresAt = new Date(Date.now() + refreshExpiryMs);

    await RefreshToken.create({
      tokenHash,
      userId: user._id,
      expiresAt,
      deviceInfo,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  /**
   * Refresh access & refresh tokens (Rotation)
   */
  static async refresh(refreshToken: string, deviceInfo?: string) {
    const tokenHash = hashToken(refreshToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash });

    if (!tokenDoc) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (tokenDoc.expiresAt < new Date()) {
      await tokenDoc.deleteOne();
      throw ApiError.unauthorized('Expired refresh token');
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    // Delete old refresh token (rotation)
    await tokenDoc.deleteOne();

    // Generate new tokens
    const payload = {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles,
      name: user.name,
    };

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = generateRefreshToken();

    // Save new hashed refresh token to DB
    const newTokenHash = hashToken(newRefreshToken);
    const refreshExpiryMs = parseDuration(config.jwt.refreshExpiration);
    const expiresAt = new Date(Date.now() + refreshExpiryMs);

    await RefreshToken.create({
      tokenHash: newTokenHash,
      userId: user._id,
      expiresAt,
      deviceInfo,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  /**
   * Log out user
   */
  static async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await RefreshToken.deleteOne({ tokenHash });
  }

  /**
   * Forgot password request
   */
  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    // For security, don't throw error if email does not exist, just return success msg.
    if (!user) {
      return;
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordTokenHash = hashToken(resetToken);
    const resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetPasswordTokenHash = resetPasswordTokenHash;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Log reset link to console for local testing
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    logger.info(`[MAIL SENDER] Password reset link for ${email}: ${resetLink}`);
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, password: string) {
    const resetPasswordTokenHash = hashToken(token);
    const user = await User.findOne({
      resetPasswordTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    user.passwordHash = password; // pre-save hashes it
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
}
