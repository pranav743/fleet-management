import express from 'express';
import * as bookingController from '../controllers/bookingController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookings);

export default router;
