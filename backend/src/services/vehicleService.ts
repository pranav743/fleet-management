import Vehicle, { IVehicle, VehicleStatus, VehicleType } from '../models/Vehicle';
import AppError from '../utils/AppError';
import { IUser, UserRole } from '../models/User';

export const createVehicle = async (vehicleData: Partial<IVehicle>, user: IUser) => {
  const vehicle = await Vehicle.create({
    ...vehicleData,
    ownerId: user._id,
  });
  return vehicle;
};

export const getVehicles = async (query: any, user: IUser) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const order = query.order === 'asc' ? 1 : -1;

  const filter: any = {};

  if (user.role === UserRole.OWNER) {
    filter.ownerId = user._id;
  } else if (user.role === UserRole.DRIVER) {
    filter.status = VehicleStatus.IDLE; 
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.make) {
    filter.make = { $regex: query.make, $options: 'i' };
  }

  if (query.model) {
    filter.vehicleModel = { $regex: query.model, $options: 'i' };
  }

  if (query.registrationNumber) {
    filter.registrationNumber = { $regex: query.registrationNumber, $options: 'i' };
  }

  if (query.year) {
    filter.year = parseInt(query.year);
  }

  const totalItems = await Vehicle.countDocuments(filter);
  
  const sortField: any = {};
  sortField[sortBy] = order;
  
  const vehicles = await Vehicle.find(filter)
    .sort(sortField)
    .skip(skip)
    .limit(limit);

  return {
    vehicles,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPrevPage: page > 1,
    },
  };
};

export const getVehicleById = async (id: string, user: IUser) => {
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (user.role === UserRole.OWNER && vehicle.ownerId.toString() !== user._id.toString()) {
    throw new AppError('You do not have permission to view this vehicle', 403);
  }

  return vehicle;
};

export const updateVehicle = async (id: string, updateData: Partial<IVehicle>, user: IUser) => {
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (user.role === UserRole.OWNER && vehicle.ownerId.toString() !== user._id.toString()) {
    throw new AppError('You do not have permission to update this vehicle', 403);
  }

  Object.assign(vehicle, updateData);
  await vehicle.save();

  return vehicle;
};

export const deleteVehicle = async (id: string, user: IUser) => {
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (user.role === UserRole.OWNER && vehicle.ownerId.toString() !== user._id.toString()) {
    throw new AppError('You do not have permission to delete this vehicle', 403);
  }

  const Booking = (await import('../models/Booking')).default;
  const { BookingStatus } = await import('../models/Booking');
  const Trip = (await import('../models/Trip')).default;
  const { TripStatus } = await import('../models/Trip');

  const activeBooking = await Booking.findOne({
    vehicleId: vehicle._id,
    status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
  });

  if (activeBooking) {
    throw new AppError('Cannot delete vehicle with active bookings. Please cancel all bookings first.', 400);
  }

  const activeTrip = await Trip.findOne({
    vehicleId: vehicle._id,
    status: { $in: [TripStatus.ASSIGNED, TripStatus.STARTED] },
  });

  if (activeTrip) {
    throw new AppError('Cannot delete vehicle with active trips. Please complete all trips first.', 400);
  }

  vehicle.isDeleted = true;
  vehicle.deletedAt = new Date();
  await vehicle.save();
};

export const registerVehicle = async (vehicleId: string, user: IUser) => {
  // Check if driver already has a registered vehicle
  const existingRegistration = await Vehicle.findOne({ driverId: user._id });
  
  if (existingRegistration) {
    throw new AppError('You are already registered to a vehicle. Please return it first before registering a new one.', 400);
  }

  // Find the vehicle
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // Check if vehicle is available (IDLE and no driver assigned)
  if (vehicle.status !== VehicleStatus.IDLE) {
    throw new AppError('Vehicle is not available for registration', 400);
  }

  if (vehicle.driverId) {
    throw new AppError('Vehicle is already registered to another driver', 400);
  }

  // Register the driver to the vehicle
  vehicle.driverId = user._id;
  await vehicle.save();

  return vehicle;
};

export const getRegisteredVehicle = async (user: IUser) => {
  const vehicle = await Vehicle.findOne({ driverId: user._id })
    .populate('ownerId', 'email role');

  if (!vehicle) {
    throw new AppError('You do not have any registered vehicle', 404);
  }

  return vehicle;
};

export const returnVehicle = async (user: IUser) => {
  // Find the vehicle registered to this driver
  const vehicle = await Vehicle.findOne({ driverId: user._id });

  if (!vehicle) {
    throw new AppError('You do not have any registered vehicle', 404);
  }

  // Check if there are any active trips for this vehicle
  const Trip = (await import('../models/Trip')).default;
  const { TripStatus } = await import('../models/Trip');
  
  const activeTrip = await Trip.findOne({
    vehicleId: vehicle._id,
    driverId: user._id,
    status: { $in: [TripStatus.ASSIGNED, TripStatus.STARTED] }
  });

  if (activeTrip) {
    throw new AppError('Cannot return vehicle with active trips. Please complete all trips first.', 400);
  }

  // Unregister the driver from the vehicle
  vehicle.driverId = undefined;
  await vehicle.save();

  return vehicle;
};

export const getAvailableVehicles = async (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const order = query.order === 'asc' ? 1 : -1;
  const { startDate, endDate, type, status, make, model, registrationNumber, year } = query;
  
  const filter: any = {};
  
  if (type) {
    filter.type = type;
  }
  
  if (status) {
    filter.status = status;
  }

  if (make) {
    filter.make = { $regex: make, $options: 'i' };
  }

  if (model) {
    filter.vehicleModel = { $regex: model, $options: 'i' };
  }

  if (registrationNumber) {
    filter.registrationNumber = { $regex: registrationNumber, $options: 'i' };
  }

  if (year) {
    filter.year = parseInt(year);
  }

  const totalItems = await Vehicle.countDocuments(filter);
  
  const sortField: any = {};
  sortField[sortBy] = order;

  const vehicles = await Vehicle.find(filter)
    .populate('ownerId', 'email role')
    .populate('driverId', 'email role')
    .sort(sortField)
    .skip(skip)
    .limit(limit);

  if (!startDate || !endDate) {
    const vehiclesWithAvailability = vehicles.map((vehicle: any) => ({
      ...vehicle.toObject(),
      availableForBooking: !!vehicle.driverId && vehicle.status === VehicleStatus.IDLE,
    }));

    return {
      vehicles: vehiclesWithAvailability,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  const Booking = (await import('../models/Booking')).default;
  const { BookingStatus } = await import('../models/Booking');

  const vehiclesWithAvailability = await Promise.all(
    vehicles.map(async (vehicle: any) => {
      if (!vehicle.driverId || vehicle.status !== VehicleStatus.IDLE) {
        return {
          ...vehicle.toObject(),
          availableForBooking: false,
        };
      }

      const overlappingBooking = await Booking.findOne({
        vehicleId: vehicle._id,
        status: { $ne: BookingStatus.CANCELLED },
        $or: [
          { startDate: { $lt: new Date(endDate) }, endDate: { $gt: new Date(startDate) } },
        ],
      });

      return {
        ...vehicle.toObject(),
        availableForBooking: !overlappingBooking,
      };
    })
  );

  return {
    vehicles: vehiclesWithAvailability,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPrevPage: page > 1,
    },
  };
};
