import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../types/interfaces';

// Middleware function to check if a user is authenticated by verifying the JWT token from the signed cookie.
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

// Middleware function to check if the user has the required role.
type IRole = 'admin' | 'customer' | 'cooker';

export const checkRole =
  (requiredRole: IRole) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Assuming you have already implemented an isAuthenticated middleware to check if the user is authenticated
    const userReq = req.user as IUser;
    if (!userReq) {
      return res.status(401).json({ message: 'No token, Unauthorized.' });
    }

    // Check if the user's role matches the required role
    if (userReq.role !== requiredRole) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // If the user has the required role, proceed to the next middleware/controller
    return next();
  };
