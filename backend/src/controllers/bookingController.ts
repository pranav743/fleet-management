import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/bookingService';
import asyncWrapper from '../utils/asyncWrapper';
import { createBookingSchema } from '../utils/validation';
import AppError from '../utils/AppError';

export const createBooking = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const validation = createBookingSchema.safeParse(req.body);
  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const booking = await bookingService.createBooking(req.body, req.user!);

  res.status(201).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

export const getBookings = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const result = await bookingService.getBookings(req.user!, req.query);

  res.status(200).json({
    status: 'success',
    results: result.bookings.length,
    pagination: result.pagination,
    data: {
      bookings: result.bookings,
    },
  });
});

export const cancelBooking = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user!);

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: {
      booking,
    },
  });
});
