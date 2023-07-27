import express, { Request, Response } from 'express';
import { authenticate } from '../middlewares/authentication';
import checkRole from '../middlewares/authorization';
import CartController from '../controllers/cart';

const router = express.Router();

router.get('/', authenticate, checkRole('customer'), CartController.getCart);

export default router;
