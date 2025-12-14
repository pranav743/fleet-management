import express from 'express';
import * as tripController from '../controllers/tripController';
import { protect } from '../middlewares/auth';
import { restrictTo } from '../middlewares/role';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo(UserRole.ADMIN), tripController.createTrip);
router.get('/', restrictTo(UserRole.DRIVER), tripController.getTrips);
router.patch('/:id', restrictTo(UserRole.DRIVER), tripController.updateTripStatus);

export default router;
