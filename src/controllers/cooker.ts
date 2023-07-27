// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { Request, Response } from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import Food from '../models/food';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import User from '../models/user';

// eslint-disable-next-line consistent-return
const createDish = async (req: Request, res: Response) => {
  try {
    const { cookerId } = req.params;
    const dishData = req.body;

    const user = await User.findById(cookerId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.role !== 'cooker') {
      return res.status(403).json({
        message: 'User is not a cooker',
      });
    }

    const food = await Food.create({
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...dishData,
      user_id: cookerId,
    });

    res.status(201).json({
      message: 'Dish created successfully',
      data: {
        dish: food,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while creating the dish',
      error: err,
    });
  }
};

const deleteDish = async (req: Request, res: Response) => {
  try {
    const { cookerId, dishId } = req.params;

    const user = await User.findById(cookerId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.role !== 'cooker') {
      return res.status(403).json({
        message: 'User is not a cooker',
      });
    }

    const dish = await Food.findOne({ _id: dishId, user_id: cookerId });

    if (!dish) {
      return res.status(404).json({
        message: 'Dish not found',
      });
    }

    await Food.deleteOne({ _id: dishId });

    res.status(200).json({
      message: 'Dish deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while deleting the dish',
    });
  }
};

const getDishes = async (req: Request, res: Response) => {
  try {
    const { cookerId } = req.params;

    const dishes = await Food.find({ user_id: cookerId });

    res.status(200).json({
      message: 'Dishes retrieved successfully',
      data: {
        dishes,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while retrieving the dishes',
      error: err,
    });
  }
};

const updateDish = async (req: Request, res: Response) => {
  try {
    const { cookerId, dishId } = req.params;
    const dishData = req.body;

    const user = await User.findById(cookerId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.role !== 'cooker') {
      return res.status(403).json({
        message: 'User is not a cooker',
      });
    }

    const dish = await Food.findOne({ _id: dishId, user_id: cookerId });

    if (!dish) {
      return res.status(404).json({
        message: 'Dish not found',
      });
    }

    await Food.updateOne({ _id: dishId }, { $set: dishData });

    res.status(200).json({
      message: 'Dish updated successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while updating the dish',
      error: err,
    });
  }
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export { createDish, getDishes, deleteDish, updateDish };
