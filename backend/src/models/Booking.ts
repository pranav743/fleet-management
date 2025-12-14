import mongoose, { Schema, Document } from 'mongoose';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface IBooking extends SoftDeleteDocument {
  customerId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalCost: number;
  status: BookingStatus;
}

const bookingSchema = new Schema<IBooking>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.plugin(softDeletePlugin);

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
export default Booking;
