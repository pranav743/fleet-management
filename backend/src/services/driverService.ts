import User, { IUser, UserRole } from '../models/User';
import Vehicle from '../models/Vehicle';
import Trip, { TripStatus } from '../models/Trip';
import AppError from '../utils/AppError';
import bcrypt from 'bcryptjs';

export const createDriver = async (driverData: { email: string; password: string }) => {
  const { email, password } = driverData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const driver = await User.create({
    email,
    password: hashedPassword,
    role: UserRole.DRIVER,
  });
  // No password in response
  const driverResponse = driver.toObject();
  delete driverResponse.password;
  return driverResponse;
};

export const getDrivers = async (query: any) => {
  const { page = 1, limit = 10, email, sortBy = 'createdAt', order = 'desc' } = query;

  // Filter
  const filter: any = { role: UserRole.DRIVER, isDeleted: false };
  if (email) {
    filter.email = { $regex: email, $options: 'i' }; // Case-insensitive search
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Build sort object
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort: any = { [sortBy]: sortOrder };

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  // Get drivers with pagination and sorting
  const drivers = await User.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  return {
    drivers,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit),
      hasNextPage: skip + drivers.length < total,
      hasPrevPage: Number(page) > 1,
    },
  };
};

export const getDriverById = async (id: string) => {
  const driver = await User.findOne({ _id: id, role: UserRole.DRIVER, isDeleted: false });

  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  return driver;
};

export const deleteDriver = async (id: string) => {
  const driver = await User.findOne({ _id: id, role: UserRole.DRIVER });

  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  // Check if driver has any active trips
  const activeTrip = await Trip.findOne({
    driverId: id,
    status: { $in: [TripStatus.ASSIGNED, TripStatus.STARTED] },
  });

  if (activeTrip) {
    throw new AppError('Cannot delete driver with active trips. Please complete or reassign trips first.', 400);
  }

  // Check if driver is registered to any vehicle
  const registeredVehicle = await Vehicle.findOne({ driverId: id });
  if (registeredVehicle) {
    // Unregister driver from vehicle
    registeredVehicle.driverId = undefined;
    await registeredVehicle.save();
  }

  // Soft delete the driver
  driver.isDeleted = true;
  driver.deletedAt = new Date();
  await driver.save();

  return driver;
};
