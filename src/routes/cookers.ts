// eslint-disable-next-line node/no-unsupported-features/es-syntax
import express from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import {
  createDish,
  getDishes,
  deleteDish,
  updateDish,
} from '../controllers/cooker';

// eslint-disable-next-line node/no-unsupported-features/es-syntax
import multer from 'multer';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { CloudinaryStorage } from 'multer-storage-cloudinary';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { v2 as cloudinary } from 'cloudinary';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import isAuthorized from '../middlewares/isAuth';

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
  isAuthorized,
  createDish
);
cookerRouter.put('/:cookerId/:dishId', isAuthorized, updateDish);
cookerRouter.delete('/:cookerId/:dishId', isAuthorized, deleteDish);
cookerRouter.get('/:cookerId/dishes', getDishes);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default cookerRouter;
