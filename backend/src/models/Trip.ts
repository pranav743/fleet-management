import mongoose, { Schema, Document } from 'mongoose';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete';

export enum TripStatus {
  ASSIGNED = 'ASSIGNED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
}

export interface ITrip extends SoftDeleteDocument {
  bookingId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  status: TripStatus;
  startOdometer?: number;
  endOdometer?: number;
  startTime?: Date;
  endTime?: Date;
}

const tripSchema = new Schema<ITrip>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TripStatus),
      default: TripStatus.ASSIGNED,
    },
    startOdometer: {
      type: Number,
    },
    endOdometer: {
      type: Number,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.plugin(softDeletePlugin);

const Trip = mongoose.model<ITrip>('Trip', tripSchema);
export default Trip;
