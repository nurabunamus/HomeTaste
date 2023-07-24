/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import { updateUserProfile } from '../controllers/user'; // Import the controller function
import upload from '../middlewares/multer'; // Import the Multer middleware
import isAuthorized from '../middlewares/isAuth';

const router = express.Router();

/* PATCH route for updating user profile information, including the profile image.
 * This route is protected and requires the user to be authorized using the 'isAuthorized' middleware.
 */
router.patch(
  '/profile',
  isAuthorized,
  upload.single('profile_image'),
  updateUserProfile
);

export default router;
