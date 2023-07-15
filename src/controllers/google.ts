/* eslint-disable no-underscore-dangle */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { Request, Response } from 'express';
import User from '../models/user';
import { IUser } from '../types/interfaces';
import { setTokenCookie } from '../utils/auth';

/**
 * Saves user data received from Google authentication.
 * If the user does not exist, a new user is created and saved in the database.
 * Generates a JSON Web Token (JWT) for the user and sets it as a cookie in the response.
 */

type JsonType = {
  family_name: string;
  given_name: string;
  name: string;
  sub: string;
  email: string;
};

async function saveGoogle(req: Request, res: Response) {
  try {
    const userReq = req.user as IUser & { _json: JsonType };
    const googleId = `google-${userReq._json.sub}`;
    const user = await User.findOne({ email: userReq._json.email });
    if (!user) {
      const newUser = await User.create({
        first_name: userReq._json.given_name,
        last_name: userReq._json.family_name,
        email: userReq._json.email,
        provider_id: googleId,
      });
      await newUser.save();
      setTokenCookie(newUser._id, newUser.role, newUser.fullName, res);

      res.status(200).json({
        message: 'User successfully signed in',
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
        },
      });
    } else {
      res.status(400).send({ error: 'User already exists' });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default saveGoogle;
