import jwt, { Secret } from 'jsonwebtoken';
import { Response } from 'express';

// This type makes it possible for the two functions in this file to have typed named parameters
type Params = {
  userId: string;
  fullName: string;
  email?: string;
  res?: Response;
  role?: string;
};

export const setTokenCookie = ({
  userId,
  fullName,
  email,
  res,
}: Params): void | string => {
  const payload = {
    _id: userId,
    fullName,
    email,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY!, {
    expiresIn: '14 days',
  });
  res?.cookie('authToken', token, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    secure: false,
    // We should add them when we are going to deploy our app
    // secure: process.env.DEPLOYED === 'yes',
    // sameSite: 'none',
  });

  return token;
};

export const setCompletedTokenCookie = ({
  userId,
  role,
  fullName,
  email,
  res,
}: Params): void | string => {
  const payload = {
    _id: userId,
    fullName,
    role,
    email,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY as Secret, {
    expiresIn: '14 days',
  });

  res?.cookie('authTokenCompleted', token, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    secure: false,
    // We should add them when we are going to deploy our app
    // secure: process.env.DEPLOYED === 'yes',
    // sameSite: 'none',
  });
  return token;
};
