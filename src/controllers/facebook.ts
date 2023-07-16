import { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from '../middlewares/authentication';

dotenv.config();

// Facebook Authentication Controller Class That Containes All The Routes
class FacebookAuthController {
  static fBAuthenticate = passport.authenticate('facebook', {
    scope: ['public_profile', 'email'],
  });

  static fbCallBackAuthenticate = passport.authenticate('facebook', {
    session: false,
    failureRedirect: `${process.env.BASE_URL}/api/auth/facebook/failure`,
  });

  static afterFbCallback = (req: Request, res: Response) => {
    res.cookie('auth_token', req.user, {
      httpOnly: true,
      signed: true,
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      secure: false,
      // We should add them when we are going to deploy our app
      // secure: process.env.DEPLOYED === 'yes',
      // sameSite: 'none',
    });

    res.redirect(`${process.env.BASE_URL}/api/auth/facebook/success`);
  };

  static fBAuthFailure = (req: Request, res: Response) => {
    res.json('facebook auth failed,please try again');
  };

  static fbAuthSuccess = (req: Request, res: Response) => {
    res.json('facebook auth is successful');
  };
}

export default FacebookAuthController;
