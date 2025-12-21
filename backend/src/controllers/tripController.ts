import { Request, Response, NextFunction } from 'express';
import * as tripService from '../services/tripService';
import asyncWrapper from '../utils/asyncWrapper';
import AppError from '../utils/AppError';

export const createTrip = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { bookingId, driverId } = req.body;
  if (!bookingId || !driverId) {
    throw new AppError('Booking ID and Driver ID are required', 400);
  }

  const trip = await tripService.createTrip(bookingId, driverId);

  res.status(201).json({
    status: 'success',
    data: {
      trip,
    },
  });
});

export const updateTripStatus = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  const trip = await tripService.updateTripStatus(req.params.id, status, req.user!);

  res.status(200).json({
    status: 'success',
    data: {
      trip,
    },
  });
});

export const getTrips = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const trips = await tripService.getTrips(req.user!);

  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: {
      trips,
    },
  });
});

export const cancelTrip = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const trip = await tripService.cancelTrip(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Trip cancelled successfully',
    data: {
      trip,
    },
  });
});
