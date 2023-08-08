import express from 'express';
import { getFoodById, getFoodFilter } from '../controllers/food';

const foodRouter = express.Router();

foodRouter.get('/:foodId', getFoodById);
foodRouter.get('/', getFoodFilter);

export default foodRouter;
