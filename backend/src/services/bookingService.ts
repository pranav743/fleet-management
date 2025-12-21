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

  // Check if vehicle has a registered driver
  if (!vehicle.driverId) {
    throw new AppError('Vehicle does not have a registered driver. Please select a vehicle with an assigned driver.', 400);
  }

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    vehicleId,
    status: { $nin: [BookingStatus.CANCELLED, BookingStatus.COMPLETED] },
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
    status: BookingStatus.CONFIRMED,
  });

  // Automatically create a trip and assign to the registered driver
  const Trip = (await import('../models/Trip')).default;
  const { TripStatus } = await import('../models/Trip');

  await Trip.create({
    bookingId: booking._id,
    driverId: vehicle.driverId,
    vehicleId: vehicle._id,
    status: TripStatus.ASSIGNED,
  });

  return booking;
};

export const getBookings = async (user: IUser, query: any) => {
  const { page = 1, limit = 10 } = query;
  const filter: any = {};

  if (user.role === 'CUSTOMER') {
    filter.customerId = user._id;
  } else if (user.role === 'ADMIN' || user.role === 'OWNER') {
    if (query.vehicleId) {
      filter.vehicleId = query.vehicleId;
    }
    
    if (query.customerId) {
      filter.customerId = query.customerId;
    }
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.registrationNumber) {
      const Vehicle = (await import('../models/Vehicle')).default;
      const vehicles = await Vehicle.find({
        registrationNumber: { $regex: query.registrationNumber, $options: 'i' }
      }).select('_id');
      const vehicleIds = vehicles.map(v => v._id);
      
      if (filter.vehicleId) {
        if (Array.isArray(filter.vehicleId.$in)) {
          filter.vehicleId = { $in: filter.vehicleId.$in.filter((id: any) => 
            vehicleIds.some(vid => vid.toString() === id.toString())
          )};
        } else {
          filter.vehicleId = vehicleIds.some(vid => vid.toString() === filter.vehicleId.toString()) 
            ? filter.vehicleId 
            : null;
        }
      } else {
        filter.vehicleId = { $in: vehicleIds };
      }
    }
    
    if (query.startDate || query.endDate) {
      filter.$and = [];
      
      if (query.startDate) {
        filter.$and.push({ startDate: { $gte: new Date(query.startDate) } });
      }
      
      if (query.endDate) {
        filter.$and.push({ endDate: { $lte: new Date(query.endDate) } });
      }
    }
    
    if (user.role === 'OWNER') {
      const Vehicle = (await import('../models/Vehicle')).default;
      const ownerVehicles = await Vehicle.find({ ownerId: user._id }).select('_id');
      const vehicleIds = ownerVehicles.map(v => v._id);
      
      if (filter.vehicleId && filter.vehicleId.$in) {
        filter.vehicleId = { $in: filter.vehicleId.$in.filter((id: any) => 
          vehicleIds.some(vid => vid.toString() === id.toString())
        )};
      } else if (filter.vehicleId) {
        filter.vehicleId = vehicleIds.some(vid => vid.toString() === filter.vehicleId.toString()) 
          ? filter.vehicleId 
          : null;
      } else {
        filter.vehicleId = { $in: vehicleIds };
      }
    }
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Get total count
  const total = await Booking.countDocuments(filter);

  const bookings = await Booking.find(filter)
    .populate('vehicleId')
    .populate('customerId', 'email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    
  return {
    bookings,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit),
      hasNextPage: skip + bookings.length < total,
      hasPrevPage: Number(page) > 1,
    },
  };
};

export const cancelBooking = async (bookingId: string, user: IUser) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check permissions
  if (user.role === 'CUSTOMER') {
    // Customers can only cancel their own bookings
    if (booking.customerId.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to cancel this booking', 403);
    }
  } else if (user.role === 'OWNER') {
    // Owners can cancel bookings for their vehicles
    const vehicle = await Vehicle.findById(booking.vehicleId);
    if (!vehicle || vehicle.ownerId.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to cancel this booking', 403);
    }
  }
  // Admins can cancel any booking

  if (booking.status === BookingStatus.CANCELLED) {
    throw new AppError('Booking is already cancelled', 400);
  }

  if (booking.status === BookingStatus.COMPLETED) {
    throw new AppError('Cannot cancel a completed booking', 400);
  }

  // Cancel the booking
  booking.status = BookingStatus.CANCELLED;
  await booking.save();

  // Cancel associated trip if exists and reset vehicle status to IDLE
  const Trip = (await import('../models/Trip')).default;
  const { TripStatus } = await import('../models/Trip');
  
  const trip = await Trip.findOne({ bookingId: booking._id });
  if (trip && (trip.status === TripStatus.ASSIGNED || trip.status === TripStatus.STARTED)) {
    trip.isDeleted = true;
    trip.deletedAt = new Date();
    await trip.save();
    
    // Reset vehicle status to IDLE
    const vehicle = await Vehicle.findById(booking.vehicleId);
    if (vehicle) {
      vehicle.status = VehicleStatus.IDLE;
      await vehicle.save();
    }
  }

  return booking;
};
