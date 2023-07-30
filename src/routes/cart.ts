import express, { Request, Response } from 'express';
import { authenticate } from '../middlewares/authentication';
import isAuthorized from '../middlewares/isAuth';
import checkRole from '../middlewares/authorization';
import CartController from '../controllers/cart';

const router = express.Router();

router.get('/', authenticate, checkRole('customer'), CartController.getCart);
router.post('/', CartController.addDishToCart);

export default router;
