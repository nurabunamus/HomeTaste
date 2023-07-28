import jwt from 'jsonwebtoken';

import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userCookie?: { role: string };
    }
  }
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authTokenCompleted } = req.signedCookies;

    if (!authTokenCompleted) {
      res.redirect(301, '/');
    }
    const verified = jwt.verify(
      authTokenCompleted,
      String(process.env.SECRET_KEY)
    );
    if (typeof verified === 'object' && 'role' in verified) {
      req.userCookie = { role: verified?.role };
    }
    next();
  } catch (err) {
    res.redirect(301, '/');
  }
};

const preventMultiLogin = (req: Request, res: Response, next: NextFunction) => {
  const { authTokenCompleted } = req.cookies;

  if (authTokenCompleted) {
    res.redirect(301, '/');
  }
  next();
};

export { authenticate, preventMultiLogin };
