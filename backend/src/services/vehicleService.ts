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
  const filter: any = {};

  if (user.role === UserRole.OWNER) {
    filter.ownerId = user._id;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.type) {
    filter.type = query.type;
  }

  const vehicles = await Vehicle.find(filter);
  return vehicles;
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

  vehicle.isDeleted = true;
  vehicle.deletedAt = new Date();
  await vehicle.save();
};
