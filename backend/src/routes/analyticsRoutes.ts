import express from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { protect } from '../middlewares/auth';
import { restrictTo } from '../middlewares/role';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);

router.get('/dashboard', restrictTo(UserRole.ADMIN, UserRole.OWNER, UserRole.DRIVER), analyticsController.getDashboard);

router.get('/top-owners', restrictTo(UserRole.ADMIN), analyticsController.getTopRevenueOwners);

router.get('/top-vehicles', restrictTo(UserRole.ADMIN), analyticsController.getTopVehicles);

router.get('/top-customers', restrictTo(UserRole.ADMIN), analyticsController.getTopCustomers);

export default router;
