import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { UserRole } from '../models/User';

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('User:', req.user);
    console.log(roles)
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
