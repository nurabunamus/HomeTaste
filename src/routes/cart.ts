import express from 'express';
import { isAuthenticated, checkRole } from '../middlewares/isAuth';
import CartController from '../controllers/cart';

const router = express.Router();

router.get('/', isAuthenticated, checkRole('customer'), CartController.getCart);
router.post(
  '/',
  isAuthenticated,
  checkRole('customer'),
  CartController.addDishToCart
);
router.get(
  '/deleteAll',
  isAuthenticated,
  checkRole('customer'),
  CartController.emptyCart
);
router.delete(
  '/',
  isAuthenticated,
  checkRole('customer'),
  CartController.deleteItem
);

router.put(
  '/',
  isAuthenticated,
  checkRole('customer'),
  CartController.changeQuantity
);

export default router;
