import { Request, Response, NextFunction } from 'express';
import * as vehicleService from '../services/vehicleService';
import asyncWrapper from '../utils/asyncWrapper';
import { createVehicleSchema } from '../utils/validation';
import AppError from '../utils/AppError';

export const createVehicle = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const validation = createVehicleSchema.safeParse(req.body);
  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const vehicle = await vehicleService.createVehicle(req.body, req.user!);

  res.status(201).json({
    status: 'success',
    data: {
      vehicle,
    },
  });
});

export const getVehicles = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const vehicles = await vehicleService.getVehicles(req.query, req.user!);

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: {
      vehicles,
    },
  });
});

export const getVehicle = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id, req.user!);

  res.status(200).json({
    status: 'success',
    data: {
      vehicle,
    },
  });
});

export const updateVehicle = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body, req.user!);

  res.status(200).json({
    status: 'success',
    data: {
      vehicle,
    },
  });
});

export const deleteVehicle = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  await vehicleService.deleteVehicle(req.params.id, req.user!);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
