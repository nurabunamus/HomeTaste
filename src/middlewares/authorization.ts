// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user_cookie?: { role: string };
    }
  }
}

// eslint-disable-next-line arrow-body-style
const checkRole = (role: string) => {
  // eslint-disable-next-line consistent-return
  return (req: Request, res: Response, next: NextFunction) => {
    if (req?.user_cookie?.role !== role) {
      return res.redirect(301, '/');
    }
    next();
  };
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default checkRole;
