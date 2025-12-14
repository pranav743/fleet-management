import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService';
import asyncWrapper from '../utils/asyncWrapper';

export const getDashboard = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await analyticsService.getDashboardStats();

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
