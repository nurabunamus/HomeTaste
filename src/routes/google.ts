/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import express, { Request, Response } from 'express';
import passport from '../config/passport';
import saveGoogle from '../controllers/google';

const router = express.Router();

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
/**
 * Route for user logout.
 * Clears the authentication token cookie from the response and sends a success message.
 */
router.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token');
  res.send('Cookie deleted successfully');
  res.end();
});

export default router;
