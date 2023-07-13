/* eslint-disable no-underscore-dangle */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/user';
import { IUser } from '../types/interfaces';

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
  const userReq = req.user as IUser & { _json: JsonType };
  const googleId = `google-${userReq._json.sub}`;
  const user = await User.findOne({ provider_id: googleId });
  if (!user) {
    const newUser = await User.create({
      first_name: userReq._json.given_name,
      last_name: userReq._json.family_name,
      email: userReq._json.email,
      provider_id: googleId,
    });
    await newUser.save();

    const secretKey = process.env.SECRET_KEY as Secret;
    const payload = {
      id: newUser._id,
      fullName: `${newUser.first_name} ${newUser.last_name}`,
      email: newUser.email,
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: '14 days' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      signed: true,
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      secure: false,
    });
    res.status(200).json({
      message: 'User successfully signed in',
      user: payload,
    });
  }
}

export default saveGoogle;
