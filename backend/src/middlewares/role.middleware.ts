import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { UserRole } from '../constants/enums';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role as UserRole));
    if (!hasRole) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }

    next();
  };
};

export default requireRole;
