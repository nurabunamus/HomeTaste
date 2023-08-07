import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userCookie?: { role: string };
    }
  }
}

const checkRole =
  (role: string) => (req: Request, res: Response, next: NextFunction) => {
    if (req?.userCookie?.role !== role) {
      res.redirect(301, '/');
    } else {
      next();
    }
  };

export default checkRole;
