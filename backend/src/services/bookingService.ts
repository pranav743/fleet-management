import Booking, { IBooking, BookingStatus } from '../models/Booking';
import Vehicle, { VehicleStatus } from '../models/Vehicle';
import AppError from '../utils/AppError';
import { IUser } from '../models/User';

export const createBooking = async (bookingData: Partial<IBooking>, user: IUser) => {
  const { vehicleId, startDate, endDate } = bookingData;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (vehicle.status !== VehicleStatus.IDLE) {
    throw new AppError('Vehicle is not available', 400);
  }

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    vehicleId,
    status: { $ne: BookingStatus.CANCELLED },
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
    ],
  });

  if (overlappingBooking) {
    throw new AppError('Vehicle is already booked for these dates', 400);
  }

  // Calculate total cost (simplified logic: $100 per day)
  const days = (new Date(endDate!).getTime() - new Date(startDate!).getTime()) / (1000 * 60 * 60 * 24);
  const totalCost = Math.ceil(days) * 100;

  const booking = await Booking.create({
    ...bookingData,
    customerId: user._id,
    totalCost,
  });

  return booking;
};

export const getBookings = async (user: IUser) => {
  const bookings = await Booking.find({ customerId: user._id }).populate('vehicleId');
  return bookings;
};
