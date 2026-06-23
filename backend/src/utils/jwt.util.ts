import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/app.config';
import { UserTokenPayload } from '../types/common.types';

export const signAccessToken = (payload: UserTokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiration,
  });
};

export const verifyAccessToken = (token: string): UserTokenPayload => {
  return jwt.verify(token, config.jwt.secret) as UserTokenPayload;
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyTokenHash = (token: string, hash: string): boolean => {
  const hashed = hashToken(token);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hashed, 'hex'),
      Buffer.from(hash, 'hex')
    );
  } catch (error) {
    return false;
  }
};

