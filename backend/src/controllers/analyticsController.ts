import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService';
import asyncWrapper from '../utils/asyncWrapper';

export const getDashboard = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await analyticsService.getDashboardStats(req.user!);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

export const getTopRevenueOwners = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const result = await analyticsService.getTopRevenueOwners(req.query);

  res.status(200).json({
    status: 'success',
    results: result.owners.length,
    pagination: result.pagination,
    data: {
      owners: result.owners,
    },
  });
});

export const getTopVehicles = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const result = await analyticsService.getTopVehicles(req.query);

  res.status(200).json({
    status: 'success',
    results: result.vehicles.length,
    pagination: result.pagination,
    data: {
      vehicles: result.vehicles,
    },
  });
});

export const getTopCustomers = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const result = await analyticsService.getTopCustomers(req.query);

  res.status(200).json({
    status: 'success',
    results: result.customers.length,
    pagination: result.pagination,
    data: {
      customers: result.customers,
    },
  });
});
