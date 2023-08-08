import express from 'express';
import adminController from '../controllers/admin';
import { isAuthenticated, checkRole } from '../middlewares/isAuth';

const router = express.Router();

router.get(
  '/cooker',
  isAuthenticated,
  checkRole('admin'),
  adminController.getCooker
);

router.get(
  '/customers',
  isAuthenticated,
  checkRole('admin'),
  adminController.getCustomers
);

export default router;
