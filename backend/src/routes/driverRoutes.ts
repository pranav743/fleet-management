import express from 'express';
import * as driverController from '../controllers/driverController';
import { protect } from '../middlewares/auth';
import { restrictTo } from '../middlewares/role';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);
router.use(restrictTo(UserRole.ADMIN));

router
  .route('/')
  .post(driverController.createDriver)
  .get(driverController.getDrivers);

router
  .route('/:id')
  .get(driverController.getDriver)
  .delete(driverController.deleteDriver);

export default router;
