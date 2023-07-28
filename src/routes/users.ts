/* eslint-disable spaced-comment */
/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import userControllers from '../controllers/user'; // Import the controller function
import upload from '../middlewares/multer'; // Import the Multer middleware
import isAuthorized from '../middlewares/isAuth';

const router = express.Router();

router.get('/profile', isAuthorized, userControllers.getUserProfile);

/* PATCH route for updating user profile information, including the profile image.
 * This route is protected and requires the user to be authorized using the 'isAuthorized' middleware.
 */
router.patch(
  '/profile/edit',
  isAuthorized,
  upload.single('profile_image'),
  userControllers.updateUserProfile
);

export default router;
