import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Cart from '../models/cart';

const getCart = async (req: Request, res: Response) => {
  try {
    const { authTokenCompleted } = req.signedCookies;
    const verified = jwt.verify(
      authTokenCompleted,
      process.env.SECRET_KEY!
    ) as JwtPayload;
    const userCart = await Cart.findOne({ user: verified._id });
    res.status(200).json(userCart);
  } catch (err) {
    res.status(401).json(err);
  }
};

export default {
  getCart,
};
