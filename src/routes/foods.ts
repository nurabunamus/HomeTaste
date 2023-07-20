// eslint-disable-next-line node/no-unsupported-features/es-syntax
import express from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import getFoodById from '../controllers/food';

const foodRouter = express.Router();

foodRouter.get('/foods/:foodId', getFoodById);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default foodRouter;
