import { Request, Response } from 'express';
import Food from '../models/food';

const getFoodById = async (req: Request, res: Response) => {
  try {
    const { foodId } = req.params;
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    return res.json(food);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const getFoodFilter = async (req: Request, res: Response) => {
  try {
    const { categories } = req.query;
    const { allergies } = req.query;
    const query: { categories?: unknown; allergies?: unknown } = {};
    if (categories) {
      query.categories = { $in: (categories as string).split(',') };
    }
    if (allergies) {
      query.allergies = { $nin: (allergies as string).split(',') };
    }
    const foods = await Food.find(query);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export { getFoodById, getFoodFilter };
