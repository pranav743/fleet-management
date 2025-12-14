import express from 'express';
import * as vehicleController from '../controllers/vehicleController';
import { protect } from '../middlewares/auth';
import { restrictTo } from '../middlewares/role';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(restrictTo(UserRole.ADMIN, UserRole.OWNER), vehicleController.createVehicle)
  .get(restrictTo(UserRole.ADMIN, UserRole.OWNER), vehicleController.getVehicles);

router
  .route('/:id')
  .get(restrictTo(UserRole.ADMIN, UserRole.OWNER), vehicleController.getVehicle)
  .patch(restrictTo(UserRole.ADMIN, UserRole.OWNER), vehicleController.updateVehicle)
  .delete(restrictTo(UserRole.ADMIN, UserRole.OWNER), vehicleController.deleteVehicle);

export default router;
