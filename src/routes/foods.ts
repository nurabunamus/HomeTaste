// eslint-disable-next-line node/no-unsupported-features/es-syntax
import express from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { getFoodById, getFoodFilter } from '../controllers/food';

const foodRouter = express.Router();

foodRouter.get('/:foodId', getFoodById);
foodRouter.get('/', getFoodFilter);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default foodRouter;
