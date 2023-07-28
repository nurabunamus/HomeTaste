/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/prefer-default-export */
/* eslint-disable prettier/prettier */
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/*
If authorized, it calls the 'next' function to proceed to the next middleware.
If not authorized, it sends a 401 Unauthorized response.
*/
const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const { authTokenCompleted } = req.signedCookies;

  if (!authTokenCompleted) {
    return res.status(401).json({ message: 'No token, Unauthorized.' });
  }

  try {
    const decoded = jwt.verify(
      authTokenCompleted,
      String(process.env.SECRET_KEY)
    );

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid/expired token.' });
  }
};

export default isAuthorized;
