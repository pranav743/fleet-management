import Trip, { TripStatus } from '../models/Trip';
import Booking, { BookingStatus } from '../models/Booking';
import Vehicle, { VehicleStatus } from '../models/Vehicle';
import AppError from '../utils/AppError';
import { IUser } from '../models/User';

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
    await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: VehicleStatus.IDLE });
    
    // Update booking status
    await Booking.findByIdAndUpdate(trip.bookingId, { status: BookingStatus.COMPLETED });
  }

  await trip.save();
  return trip;
};

export const getTrips = async (user: IUser) => {
  const trips = await Trip.find({ driverId: user._id }).populate('bookingId').populate('vehicleId');
  return trips;
};
