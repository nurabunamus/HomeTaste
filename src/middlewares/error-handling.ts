import { NextFunction, Request, Response } from 'express';
import customError from '../errors/customErrors';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof customError) {
    res.status(err.errorCode).send({ errors: err.serializeErrors() });
    next();
  } else {
    res.send(err);
  }
};

export default errorHandler;
