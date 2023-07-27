// eslint-disable-next-line node/no-unsupported-features/es-syntax
import express from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { createDish, getDishes, deleteDish } from '../controllers/cooker';

const cookerRouter = express.Router();

cookerRouter.post('/:cookerId/dish', createDish);
cookerRouter.delete('/:cookerId/:dishId', deleteDish);
cookerRouter.get('/:cookerId/dishes', getDishes);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default cookerRouter;
