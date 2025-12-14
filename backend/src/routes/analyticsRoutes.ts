import express from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { protect } from '../middlewares/auth';
import { restrictTo } from '../middlewares/role';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);
router.use(restrictTo(UserRole.ADMIN));

router.get('/dashboard', analyticsController.getDashboard);

export default router;
