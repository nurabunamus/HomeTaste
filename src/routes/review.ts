// eslint-disable-next-line node/no-unsupported-features/es-syntax
import express from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { postReview, getReviews } from '../controllers/review';

const reviewRouter = express.Router();

reviewRouter.post('/:foodId', postReview);
reviewRouter.get('/:foodId', getReviews);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default reviewRouter;
