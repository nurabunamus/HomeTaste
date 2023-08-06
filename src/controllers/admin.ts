import { Request, Response } from 'express';
import User from '../models/user';

const getCooker = async (req: Request, res: Response) => {
  try {
    const cooker = await User.find({ role: 'cooker' });
    res.status(200).json(cooker);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await User.find({ role: 'customer' });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).send(error);
  }
};

export default {
  getCooker,
  getCustomers,
};
