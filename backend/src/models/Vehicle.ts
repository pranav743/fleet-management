import mongoose, { Schema } from 'mongoose';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete';

export enum VehicleStatus {
  IDLE = 'IDLE',
  IN_TRANSIT = 'IN_TRANSIT',
  MAINTENANCE = 'MAINTENANCE',
}

export enum VehicleType {
  SUV = 'SUV',
  SEDAN = 'SEDAN',
  TRUCK = 'TRUCK',
  VAN = 'VAN',
}

export interface IVehicle extends SoftDeleteDocument {
  ownerId: mongoose.Types.ObjectId;
  make: string;
  vehicleModel: string;
  registrationNumber: string;
  type: VehicleType;
  status: VehicleStatus;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    make: {
      type: String,
      required: true,
    },
    vehicleModel: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.IDLE,
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.plugin(softDeletePlugin);

const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
export default Vehicle;
