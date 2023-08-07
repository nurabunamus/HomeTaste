import { Router } from 'express';
import passwordResetController from '../controllers/passwordReset';

const router = Router();

// Route to request a password reset
router.post(
  '/request-password-reset',
  passwordResetController.requestPasswordReset
);

// Route to reset the password using the token
router.post('/reset-password', passwordResetController.resetPassword);

export default router;
