/* eslint-disable import/newline-after-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import passport from '../config/passport';
import saveGoogle from '../controllers/google';
const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['openid', 'email', 'profile'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google',
    session: false,
  }),
  saveGoogle
);

export default router;
