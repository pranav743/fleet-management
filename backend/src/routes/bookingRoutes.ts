import express from 'express';
import * as bookingController from '../controllers/bookingController';
import { protect } from '../middlewares/auth';
import { restrictTo } from '../middlewares/role';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(restrictTo(UserRole.CUSTOMER, UserRole.ADMIN), bookingController.createBooking)
  .get(restrictTo(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.OWNER), bookingController.getBookings);

router.patch('/:id/cancel', restrictTo(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.OWNER), bookingController.cancelBooking);

export default router;
