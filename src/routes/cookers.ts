// eslint-disable-next-line node/no-unsupported-features/es-syntax
import express from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { createDish, updateDish } from '../controllers/cooker';

const cookerRouter = express.Router();

cookerRouter.post('/:cookerId/dish', createDish);
cookerRouter.put('/:cookerId/:dishId', updateDish);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default cookerRouter;
