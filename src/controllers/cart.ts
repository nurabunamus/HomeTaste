import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import Cart from '../models/cart';
import { IUser } from '../types/interfaces';

const getCart = async (req: Request, res: Response) => {
  try {
    // req.user has the decoded payload from the JWT token, which contains the role,email, and the _id of the user ->
    // so instead of casting req.user as IUser which would let req.user have all the properties of IUser ->
    // we can use the Pick type to only choose the properties from IUser that are in the decoded JWT payload.
    const userId = (
      req.user as Pick<IUser, '_id' | 'email' | 'role' | 'fullName'>
    )._id;

    const userCart = await Cart.findOne({ user: userId });
    res.status(200).json(userCart);
  } catch (err) {
    res.status(401).json(err);
  }
};

const addDishToCart = async (req: Request, res: Response) => {
  const { dishId } = req.query;

  try {
    const userId = (
      req.user as Pick<IUser, '_id' | 'email' | 'role' | 'fullName'>
    )._id;

    const userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      throw new Error(
        'You dont have a cart yet because you didnt complete registration, please go do that first'
      );
    } else {
      const isDishExists = userCart?.items?.find(
        (item) => item.dishId.toString() === (dishId as string)
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
    const userId = (
      req.user as Pick<IUser, '_id' | 'email' | 'role' | 'fullName'>
    )._id;
    const userCart = await Cart.findOne({ user: userId });

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

const deleteItem = async (req: Request, res: Response) => {
  const { dishId } = req.query;

  try {
    const userId = (
      req.user as Pick<IUser, '_id' | 'email' | 'role' | 'fullName'>
    )._id;

    const userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      return res
        .status(404)
        .json(
          'You dont have a cart yet because you didnt complete registration, please go do that first'
        );
    }

    // check if item exists in cart first
    const isItemExist = userCart.items?.find(
      (item) => item.dishId.toString() === (dishId as string)
    );

    if (isItemExist) {
      userCart.items = userCart.items?.filter(
        (item) => item.dishId.toString() !== (dishId as string)
      );

      userCart.save();

      res.status(204).json('Item Was Succesfully Deleted From Cart');
    } else {
      return res
        .status(404)
        .json('Dish with the given ID already doesnt exist in cart');
    }
  } catch (err) {
    return res.status(500).json((err as Error).message);
  }
};

export default {
  getCart,
  addDishToCart,
  emptyCart,
  deleteItem,
};
