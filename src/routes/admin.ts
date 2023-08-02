import express from 'express';
import adminController from '../controllers/admin';
import { authenticate } from '../middlewares/authentication';
import checkRole from '../middlewares/authorization';

const router = express.Router();

router.get(
  '/cooker',
  authenticate,
  checkRole('admin'),
  adminController.getCooker
);

router.get(
  '/customers',
  authenticate,
  checkRole('admin'),
  adminController.getCustomers
);

export default router;
