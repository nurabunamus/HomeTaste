import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userCookie?: { role: string };
    }
  }
}

const checkRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req?.userCookie?.role !== role) {
      res.redirect(301, '/');
    }
    next();
  };
};

export default checkRole;
