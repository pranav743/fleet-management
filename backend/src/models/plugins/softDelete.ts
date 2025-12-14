import { Schema, Document } from 'mongoose';

export interface SoftDeleteDocument extends Document {
  isDeleted: boolean;
  deletedAt?: Date;
}

const softDeletePlugin = (schema: Schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  schema.pre(/^find/, function (this: any, next: any) {
    if (this.getFilter().isDeleted === true) {
      return next();
    }
    this.find({ isDeleted: { $ne: true } });
    next();
  });

  schema.pre('aggregate', function (this: any, next: any) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
  });
};

export default softDeletePlugin;
