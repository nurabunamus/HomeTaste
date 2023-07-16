import jwt, { Secret } from 'jsonwebtoken';
import { Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const createJWTToken: any = (
  userId: string,
  fullName: string,
  email: string
): string => {
  const payload = {
    _id: userId,
    fullName: fullName,
    email: email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
    expiresIn: '14 days',
  });

  return token;
};

export default createJWTToken;
