// eslint-disable-next-line node/no-unsupported-features/es-syntax
import jwt from 'jsonwebtoken';
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

// eslint-disable-next-line consistent-return
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // eslint-disable-next-line camelcase
    const { auth_token_completed } = req.cookies;
    // eslint-disable-next-line camelcase
    if (!auth_token_completed) {
      return res.redirect(301, '/');
    }
    const verified = jwt.verify(
      auth_token_completed,
      String(process.env.SECRET_KEY)
    );
    if (typeof verified === 'object' && 'role' in verified) {
      req.user_cookie = { role: verified?.role };
    }
    next();
  } catch (err) {
    res.redirect(301, '/');
  }
};

const preventMultiLogin = (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line camelcase
  const { auth_token_completed } = req.cookies;
  // eslint-disable-next-line camelcase
  if (auth_token_completed) {
    res.redirect(301, '/');
  }
  next();
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export { authenticate, preventMultiLogin };
