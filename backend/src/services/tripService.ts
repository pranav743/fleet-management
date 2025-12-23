import Trip, { TripStatus } from '../models/Trip';
import Booking, { BookingStatus } from '../models/Booking';
import Vehicle, { VehicleStatus } from '../models/Vehicle';
import AppError from '../utils/AppError';
import { IUser } from '../models/User';
import User from '../models/User';
import * as emailService from './emailService';

export const createTrip = async (bookingId: string, driverId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status !== BookingStatus.CONFIRMED) {
    // Auto-confirm booking when trip is created/assigned
    booking.status = BookingStatus.CONFIRMED;
    await booking.save();
  }

  const trip = await Trip.create({
    bookingId,
    driverId,
    vehicleId: booking.vehicleId,
    status: TripStatus.ASSIGNED,
  });

  return trip;
};

export const updateTripStatus = async (tripId: string, status: TripStatus, user: IUser) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.driverId.toString() !== user._id.toString()) {
    throw new AppError('You are not authorized to update this trip', 403);
  }

  trip.status = status;

  if (status === TripStatus.STARTED) {
    trip.startOdometer = 1000; // Mock odometer reading
    trip.startTime = new Date();
    
    // Update vehicle status
    await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: VehicleStatus.IN_TRANSIT });
  } else if (status === TripStatus.COMPLETED) {
    trip.endOdometer = 1200; // Mock odometer reading
    trip.endTime = new Date();

    // Update vehicle status
    const vehicle = await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: VehicleStatus.IDLE });
    
    // Update booking status
    const booking = await Booking.findByIdAndUpdate(trip.bookingId, { status: BookingStatus.COMPLETED });
    
    if (booking && vehicle) {
      const customer = await User.findById(booking.customerId);
      if (customer) {
        emailService.sendTripCompletionEmail(customer.email, {
          tripId: trip._id.toString(),
          vehicleInfo: `${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})`,
          startTime: trip.startTime!,
          endTime: trip.endTime!,
          startOdometer: trip.startOdometer!,
          endOdometer: trip.endOdometer!,
        });
      }
    }
  }

  await trip.save();
  return trip;
};

export const getTrips = async (user: IUser) => {
  const trips = await Trip.find({ driverId: user._id }).populate('bookingId').populate('vehicleId');
  return trips;
};

export const cancelTrip = async (tripId: string) => {
  const trip = await Trip.findById(tripId);
  
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.isDeleted) {
    throw new AppError('Trip is already cancelled', 400);
  }

  if (trip.status === TripStatus.COMPLETED) {
    throw new AppError('Cannot cancel a completed trip', 400);
  }

  // If trip was started, update vehicle status back to IDLE
  if (trip.status === TripStatus.STARTED) {
    await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: VehicleStatus.IDLE });
  }

  // Soft delete the trip
  trip.isDeleted = true;
  trip.deletedAt = new Date();
  await trip.save();

  // Update booking status to cancelled if it's not already completed
  const booking = await Booking.findById(trip.bookingId);
  if (booking && booking.status !== BookingStatus.COMPLETED) {
    booking.status = BookingStatus.CANCELLED;
    await booking.save();
    
    const vehicle = await Vehicle.findById(trip.vehicleId);
    const customer = await User.findById(booking.customerId);
    
    if (customer && vehicle) {
      emailService.sendTripCancellationEmail(customer.email, {
        tripId: trip._id.toString(),
        vehicleInfo: `${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})`,
        bookingId: booking._id.toString(),
      });
    }
  }

  return trip;
};
