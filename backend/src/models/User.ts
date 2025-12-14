import mongoose, { Schema, Document } from 'mongoose';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete';

export enum UserRole {
  OWNER = 'OWNER',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export interface IUser extends SoftDeleteDocument {
  email: string;
  password?: string;
  role: UserRole;
  refreshToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(softDeletePlugin);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
