// eslint-disable-next-line node/no-unsupported-features/es-syntax
import express from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import {
  createDish,
  getDishes,
  deleteDish,
  updateDish,
  updateOrderStatus,
} from '../controllers/cooker';

const cookerRouter = express.Router();

cookerRouter.post('/:cookerId/dish', createDish);
cookerRouter.put('/:cookerId/:dishId', updateDish);
cookerRouter.delete('/:cookerId/:dishId', deleteDish);
cookerRouter.get('/:cookerId/dishes', getDishes);
cookerRouter.put('/orders/changeStatus', updateOrderStatus);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default cookerRouter;
