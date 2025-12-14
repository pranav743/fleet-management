import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['OWNER', 'DRIVER', 'CUSTOMER', 'ADMIN']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createVehicleSchema = z.object({
  make: z.string(),
  vehicleModel: z.string(),
  registrationNumber: z.string(),
  type: z.enum(['SUV', 'SEDAN', 'TRUCK', 'VAN']),
});

export const createBookingSchema = z.object({
  vehicleId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});
