import jwt, { Secret } from 'jsonwebtoken';
import { Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export const setTokenCookie = (
  userId: string,
  fullName: string,
  res: Response
): void => {
  const payload = {
    _id: userId,
    fullName: fullName,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
    expiresIn: '14 days',
  });

  return token;
};

export const setCompletedTokenCookie = (
  userId: string,
  role: string,
  fullName: string,
  res: Response
): void => {
  const payload = {
    _id: userId,
    // eslint-disable-next-line object-shorthand
    fullName: fullName,
    // eslint-disable-next-line object-shorthand
    role: role,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY as Secret, {
    expiresIn: '14 days',
  });
  res.cookie('auth_token_completed', token, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    secure: false,
    // We should add them when we are going to deploy our app
    // secure: process.env.DEPLOYED === 'yes',
    // sameSite: 'none',
  });
};
