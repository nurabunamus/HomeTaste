// eslint-disable-next-line node/no-unsupported-features/es-syntax
import express from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { createDish, deleteDish } from '../controllers/cooker';

const cookerRouter = express.Router();

cookerRouter.post('/:cookerId/dish', createDish);
cookerRouter.delete('/:cookerId/:dishId', deleteDish);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default cookerRouter;
