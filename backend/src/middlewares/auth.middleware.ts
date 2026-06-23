import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from './async-handler.middleware';

export const authMiddleware = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Access token is missing or invalid');
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles,
      name: decoded.name,
    };
    next();
  } catch (error) {
    throw ApiError.unauthorized('Access token is invalid or expired');
  }
});

export default authMiddleware;
