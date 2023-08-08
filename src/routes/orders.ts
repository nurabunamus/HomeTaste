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

router.put(
  '/:orderId/cancel',
  isAuthenticated,
  checkRole('customer'),
  orderControllers.cancelOrder
);
export default router;
