import { Request, Response } from 'express';
import Review from '../models/review';

const postReview = async (req: Request, res: Response) => {
  try {
    const { foodId } = req.params;
    const { rating, comment, customerId, orderId } = req.body;

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: 'Rating must be between 1 and 5' });
    }

    const review = new Review({
      rating,
      comment,
      customerId,
      dishId: foodId,
      orderId,
    });

    await review.save();

    return res
      .status(201)
      .json({ message: 'Review created successfully', review });
  } catch (error) {
    return res.status(500).json({ message: error });
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

export { postReview, getReviews };
