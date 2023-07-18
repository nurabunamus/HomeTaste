/* eslint-disable import/prefer-default-export */
/* eslint-disable node/no-unsupported-features/es-syntax */
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import jwt, { Secret } from 'jsonwebtoken';
import { Response } from 'express';

export const setTokenCookie = (
  userId: string,
  fullName: string,
  email: string,
  res: Response
): void => {
  const payload = {
    _id: userId,
    // eslint-disable-next-line object-shorthand
    fullName: fullName,
    email: email,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY as Secret, {
    expiresIn: '14 days',
  });
  res.cookie('auth_token', token, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    secure: false,
    // We should add them when we are going to deploy our app
    // secure: process.env.DEPLOYED === 'yes',
    // sameSite: 'none',
  });
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
