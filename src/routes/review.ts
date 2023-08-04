// eslint-disable-next-line node/no-unsupported-features/es-syntax
import express from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { postReview, getReviews } from '../controllers/review';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { isAuthenticated } from '../middlewares/isAuth';

const reviewRouter = express.Router();

reviewRouter.post('/:foodId', isAuthenticated, postReview);
reviewRouter.get('/:foodId', getReviews);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default reviewRouter;
