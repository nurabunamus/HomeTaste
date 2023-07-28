// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { Request, Response } from 'express';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import Review from '../models/review';

// eslint-disable-next-line consistent-return
const postReview = async (req: Request, res: Response) => {
  try {
    const { foodId } = req.params;
    const { rating, comment, userId, orderId } = req.body;

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: 'Rating must be between 1 and 5' });
    }

    const review = new Review({
      rating,
      comment,
      userId,
      dishId: foodId,
      order: orderId,
    });

    await review.save();

    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

const getReviews = async (req: Request, res: Response) => {
  try {
    const { foodId } = req.params;

    const reviews = await Review.find({ dishId: foodId });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export { postReview, getReviews };
