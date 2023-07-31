import express from 'express';
import { isAuthenticated, checkRole } from '../middlewares/isAuth';
import orderControllers from '../controllers/order';

const router = express.Router();

router.get(
  '/',
  isAuthenticated,
  checkRole('customer'),
  orderControllers.getOrders
);

router.post(
  '/create',
  isAuthenticated,
  checkRole('customer'),
  orderControllers.createOrder
);

export default router;
