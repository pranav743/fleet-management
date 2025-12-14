import express from 'express';
import * as authController from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', protect, authController.logout);

export default router;
