import express from 'express';
import { postReview, getReviews } from '../controllers/review';
import { isAuthenticated } from '../middlewares/isAuth';

const reviewRouter = express.Router();

reviewRouter.post('/:foodId', isAuthenticated, postReview);
reviewRouter.get('/:foodId', getReviews);

export default reviewRouter;
