import express from 'express';
import userControllers from '../controllers/user';
import upload from '../middlewares/multer';
import { isAuthenticated } from '../middlewares/isAuth';

const router = express.Router();

router.get('/profile', isAuthenticated, userControllers.getUserProfile);

router.patch(
  '/profile/edit',
  isAuthenticated,
  upload.single('profile_image'),
  userControllers.updateUserProfile
);

export default router;
