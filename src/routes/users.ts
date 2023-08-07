import express, { Request, Response, NextFunction } from 'express';
import userControllers from '../controllers/user'; // Import the controllers function
import { upload, fileSizeLimitErrorHandler } from '../middlewares/multer'; // Import the Multer middleware
import { isAuthenticated } from '../middlewares/isAuth';

const router = express.Router();

router.get('/profile', isAuthenticated, userControllers.getUserProfile);

router.patch(
  '/profile/edit',
  isAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    // Adding error handling for multer upload
    upload.single('profileImage')(req, res, (err) => {
      fileSizeLimitErrorHandler(err, req, res, next);
    });
  },
  userControllers.updateUserProfile
);

export default router;
