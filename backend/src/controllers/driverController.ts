import { Request, Response, NextFunction } from 'express';
import * as driverService from '../services/driverService';
import asyncWrapper from '../utils/asyncWrapper';
import AppError from '../utils/AppError';

export const createDriver = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const driver = await driverService.createDriver({ email, password });

  res.status(201).json({
    status: 'success',
    message: 'Driver created successfully',
    data: {
      driver,
    },
  });
});

export const getDrivers = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const result = await driverService.getDrivers(req.query);

  res.status(200).json({
    status: 'success',
    results: result.drivers.length,
    pagination: result.pagination,
    data: {
      drivers: result.drivers,
    },
  });
});

export const getDriver = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const driver = await driverService.getDriverById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      driver,
    },
  });
});

export const deleteDriver = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  await driverService.deleteDriver(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
