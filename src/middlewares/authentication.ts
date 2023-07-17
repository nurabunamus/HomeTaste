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
    const { auth_token } = req.cookies;
    // eslint-disable-next-line camelcase
    if (!auth_token) {
      return res.status(401).json({ errorMessage: 'Unauthorized' });
    }
    const verified = jwt.verify(auth_token, 'your_secret_key');
    if (typeof verified === 'object' && 'role' in verified) {
      req.user_cookie = { role: verified?.role };
    }
    next();
  } catch (err) {
    res.status(401).json({ errorMessage: 'Unauthorized' });
  }
};

const preventMultiLogin = (req: Request, res: Response) => {
  // eslint-disable-next-line camelcase
  const { auth_token } = req.cookies;
  // eslint-disable-next-line camelcase
  if (auth_token) {
    res.redirect(301, '/');
  }
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export { authenticate, preventMultiLogin };
