import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import asyncWrapper from '../utils/asyncWrapper';
import { signupSchema, loginSchema } from '../utils/validation';
import AppError from '../utils/AppError';

export const signup = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const validation = signupSchema.safeParse(req.body);
  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const user = await authService.signup(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const login = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const { user, accessToken, refreshToken } = await authService.login(req.body);
  console.log('User logged in:', user.email);
  res.status(200).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: {
      user,
    },
  });
});

export const refresh = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);

  res.status(200).json({
    status: 'success',
    ...tokens,
  });
});

export const logout = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      throw new AppError('No token provided', 400);
  }
  
  await authService.logout(req.user!._id.toString(), token);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});
