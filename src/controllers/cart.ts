import { Request, Response } from 'express';
import mongoose, { ObjectId } from 'mongoose';
import Cart from '../models/cart';
import { IUser } from '../types/interfaces';
import Food from '../models/food';

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

    // Find the user cart first
    const userCart = await Cart.findOne({ user: userId });

    // if cart is not found, then throw error
    if (!userCart) {
      throw new Error(
        'You dont have a cart yet because you didnt complete registration, please go do that first'
      );
    }

    // else if cart is found, and the the length of the items array is zero
    else if (!userCart.items?.length) {
      // just add the item to the items array, no need to check if the item existed before or the if item was made by a different cook
      userCart.items?.push({
        quantity: 1,
        dishId: new mongoose.Types.ObjectId(dishId as string),
      });

      userCart.save();

      res.status(200).json({ message: 'Dish Succesfully Added To Cart' });
    } else {
      // else, if length of userCart.items array is not zero, then there is atleast one item in the array
      // we need to check if the item with the given dishId is already in the cart or not first
      const isDishExists = userCart?.items?.find(
        (item) => item.dishId.toString() === (dishId as string)
      );

      // if it exists in the cart, throw an error
      if (isDishExists) {
        throw new Error('Dish Already Exists In Cart');
      }

      // else, we need to check if the dish was made by the same cook who made the other dishes in the userCart.items array
      // first we make an array that has all the current dishIds that are in the current cart + the dishId from the query params
      const dishIds: Array<string> = userCart.items!.map((item) =>
        item.dishId.toString()
      );
      dishIds.push(dishId as string);

      // Search the database for the dishes, and then count the number of distinct user_ids the returned dishes have
      const numberOfCooks = await Food.find({ _id: { $in: dishIds } }).distinct(
        'user_id'
      );

      // if all the dishes were made by the same user_id (cook), then the number of distinct user_ids must be 1
      if (numberOfCooks.length === 1) {
        userCart.items?.push({
          quantity: 1,
          dishId: new mongoose.Types.ObjectId(dishId as string),
        });

        userCart.save();

        res.status(200).json({ message: 'Dish Succesfully Added To Cart' });
      }
      // if the number of distnct user_id's (cooks) were more more than one than it means the dish that is to be added is made by a different cook
      else {
        res
          .status(400)
          .json(
            'Cant Add Dishes Made By Different Cooks To The Cart, Only Dishes Made By The Same Cook Can Be Added'
          );
      }
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

    // if item exists
    if (isItemExist) {
      // Since userCart.items is just a normal array, we can use all of the common array methods
      // By using Array.filter, we update userCart.items to be an array of items that doesn't contain the item that has the dishId from req.query
      userCart.items = userCart.items?.filter(
        (item) => item.dishId.toString() !== (dishId as string)
      );

      userCart.save();

      res.status(204).json('Item Was Succesfully Deleted From Cart');
    } else {
      // if item doesn't exist, then return an error
      return res
        .status(404)
        .json('Dish with the given ID already doesnt exist in cart');
    }
  } catch (err) {
    return res.status(500).json((err as Error).message);
  }
};

const changeQuantity = async (req: Request, res: Response) => {
  const { dishId, method } = req.query;
  try {
    const userId = (
      req.user as Pick<IUser, '_id' | 'email' | 'role' | 'fullName'>
    )._id;

    // Search for cart first
    const userCart = await Cart.findOne({ user: userId });

    // if no cart found return a 404 response with error
    if (!userCart) {
      return res
        .status(404)
        .json(
          'You dont have a cart yet because you didnt complete registration, please go do that first'
        );
    }

    // else
    // check if item exists in cart first
    const isItemExist = userCart.items?.find(
      (item) => item.dishId.toString() === (dishId as string)
    );

    // if item is found
    if (isItemExist) {
      // check the method query parameter if its increment or decrement
      if (method === 'increment') {
        const itemToBeUpdatedIndex = userCart.items?.indexOf(isItemExist);
        userCart.items![itemToBeUpdatedIndex as number].quantity += 1;
        userCart.save();
      } else if (method === 'decrement') {
        const itemToBeUpdatedIndex = userCart.items?.indexOf(isItemExist);
        userCart.items![itemToBeUpdatedIndex as number].quantity -= 1;
        userCart.save();
      }
      // if its not decrement or increment then throw an error
      else {
        throw new Error(
          "The method query string cant be any other value than 'increment' or 'decrement'"
        );
      }
      // return a 201 response with no error
      res.status(201).json('Quantity Succesfully Updated');
    }
    // else if item doesnt exist in the cart
    else {
      return res
        .status(404)
        .json('Dish with the given ID doesnt exist in cart');
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
  changeQuantity,
};
