import express from 'express';
import passport from '../config/passport';
import { preventMultiLogin } from '../middlewares/authentication';

import authController from '../controllers/auth';
import saveGoogle from '../controllers/google';
import FacebookAuthController from '../controllers/facebook';

const router = express.Router();

router.post('/register1', authController.register1);
router.post('/register2', authController.completedRegister);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/verify/:confirmationToken', authController.verifyEmail);

router.get('/register1', (req, res) => {
  res.render('register1');
});

router.get('/register2', (req, res) => {
  res.render('register2');
});

router.get('/login', (req, res) => {
  res.render('login');
});

/**
 * Initiates the Google authentication process.
 * Redirects the user to the Google authentication page.
 */
router.get(
  '/google',
  preventMultiLogin,
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
  preventMultiLogin,
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google',
    session: false,
  }),
  saveGoogle
);

router.get('/facebook', FacebookAuthController.fBAuthenticate);

router.get(
  '/facebook/callback',
  FacebookAuthController.fbCallBackAuthenticate,
  FacebookAuthController.afterFbCallback
);

router.get('/facebook/failure', FacebookAuthController.fBAuthFailure);

router.get('/facebook/success', FacebookAuthController.fbAuthSuccess);

export default router;
