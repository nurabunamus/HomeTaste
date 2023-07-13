/* eslint-disable import/first */
/* eslint-disable import/default */
/* eslint-disable node/no-unsupported-features/es-syntax */

import express from 'express';
import passport from '../config/passport';

const router = express.Router();

import authController from '../controllers/auth';
import saveGoogle from '../controllers/google';

router.post('/register1', authController.register1);
router.post('/register2', authController.completedRegister);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

/**
 * Initiates the Google authentication process.
 * Redirects the user to the Google authentication page.
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['openid', 'email', 'profile'],
  })
);

/**
 * Callback route for Google authentication.
 * Handles the authentication callback from Google after successful authentication.
 * If authentication fails, redirects the user back to the Google authentication page.
 * If authentication succeeds, saves the user data and generates a JSON Web Token (JWT).
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google',
    session: false,
  }),
  saveGoogle
);

export default router;
