import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

import {
  createDish,
  getDishes,
  deleteDish,
  updateDish,
  updateOrderStatus,
} from '../controllers/cooker';

import { checkRole, isAuthenticated } from '../middlewares/isAuth';

cloudinary.config({
  cloud_name: process.env.STORAGE_NAME,
  api_key: process.env.STORAGE_API_KEY,
  api_secret: process.env.STORAGE_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: () => ({ folder: 'food-image' }),
});

const parser = multer({ storage });

const cookerRouter = express.Router();

cookerRouter.post(
  '/:cookerId/dish',
  parser.single('image'),
  isAuthenticated,
  createDish
);
cookerRouter.put('/:cookerId/:dishId', isAuthenticated, updateDish);
cookerRouter.delete('/:cookerId/:dishId', isAuthenticated, deleteDish);
cookerRouter.get('/:cookerId/dishes', getDishes);
cookerRouter.patch(
  '/orders/changeStatus',
  isAuthenticated,
  checkRole('cooker'),
  updateOrderStatus
);

export default cookerRouter;
