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
  const result = await vehicleService.getVehicles(req.query, req.user!);

  res.status(200).json({
    status: 'success',
    results: result.vehicles.length,
    pagination: result.pagination,
    data: {
      vehicles: result.vehicles,
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

export const registerVehicle = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { vehicleId } = req.body;

  if (!vehicleId) {
    throw new AppError('Vehicle ID is required', 400);
  }

  const vehicle = await vehicleService.registerVehicle(vehicleId, req.user!);

  res.status(200).json({
    status: 'success',
    message: 'Successfully registered to vehicle',
    data: {
      vehicle,
    },
  });
});

export const getRegisteredVehicle = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const vehicle = await vehicleService.getRegisteredVehicle(req.user!);

  res.status(200).json({
    status: 'success',
    data: {
      vehicle,
    },
  });
});

export const returnVehicle = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const vehicle = await vehicleService.returnVehicle(req.user!);

  res.status(200).json({
    status: 'success',
    message: 'Successfully returned vehicle',
    data: {
      vehicle,
    },
  });
});

export const getAvailableVehicles = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const result = await vehicleService.getAvailableVehicles(req.query);

  res.status(200).json({
    status: 'success',
    results: result.vehicles.length,
    pagination: result.pagination,
    data: {
      vehicles: result.vehicles,
    },
  });
});
