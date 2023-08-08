import { Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import passport from '../config/passport';
import { setTokenCookie, setCompletedTokenCookie } from '../utils/auth';
import { IUser } from '../types/interfaces';

dotenv.config();

type decodedPayload = Pick<IUser, '_id' | 'email' | 'role' | 'fullName'>;

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
    const token = req.user as string;
    const verified = jwt.verify(token, process.env.SECRET_KEY as string);

    if ('role' in (verified as object)) {
      setCompletedTokenCookie({
        userId: (verified as decodedPayload)._id,
        fullName: (verified as decodedPayload).fullName,
        role: (verified as decodedPayload).role,
        email: (verified as decodedPayload).email,
        res,
      });
    } else {
      setTokenCookie({
        userId: (verified as decodedPayload)._id,
        fullName: (verified as decodedPayload).fullName,
        email: (verified as decodedPayload).email,
        res,
      });
    }

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
