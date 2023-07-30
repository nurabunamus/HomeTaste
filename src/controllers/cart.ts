import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import Cart from '../models/cart';
import user from './user';

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

const addDishToCart = async (req: Request, res: Response) => {
  const { dishId } = req.query;

  try {
    const { authTokenCompleted } = req.signedCookies;
    const verified = jwt.verify(
      authTokenCompleted,
      process.env.SECRET_KEY!
    ) as JwtPayload;

    const userCart = await Cart.findOne({ user: verified._id });

    if (!userCart) {
      throw new Error(
        'You dont have a cart yet because you didnt complete registration, please go do that first'
      );
    } else {
      console.log('before check items array');
      const isDishExists = userCart?.items?.find(
        (item) => item.dishId._id.toString() === (dishId as string)
      );

      if (isDishExists) {
        throw new Error('Dish Already Exists In Cart');
      }

      userCart.items?.push({
        quantity: 1,
        dishId: new mongoose.Types.ObjectId(dishId as string),
      });

      userCart.save();

      res.status(200).json({ message: 'Dish Succesfully Added To Cart' });
    }
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
};

const emptyCart = async (req: Request, res: Response) => {
  try {
    const { authTokenCompleted } = req.signedCookies;
    const verified = jwt.verify(
      authTokenCompleted,
      process.env.SECRET_KEY!
    ) as JwtPayload;

    const userCart = await Cart.findOne({ user: verified._id });

    if (!userCart) {
      throw new Error(
        'You dont have a cart yet because you didnt complete registration, please go do that first'
      );
    }

    // Make items an empty array to remove all the items that were in it;
    userCart.items = [];
    userCart.save();

    res.status(200).json('All Items In The Cart Have Been Succesfully Removed');
  } catch (err) {
    res.status(500).json((err as Error).message);
  }
};

export default {
  getCart,
  addDishToCart,
  emptyCart,
};
