import express from 'express';
import userControllers from '../controllers/user'; // Import the controller function
import upload from '../middlewares/multer'; // Import the Multer middleware
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
