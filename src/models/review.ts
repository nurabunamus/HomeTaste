import { Schema, Model, model, Types } from 'mongoose';
import { IReview, IOrder } from '../types/interfaces';

/* check the mongoose typescript documentation for more info
 https://mongoosejs.com/docs/typescript/subdocuments.html */
type ReviewDocumentOverrides = {
  order: Types.Subdocument<Types.ObjectId> & IOrder;
};

type ReviewModelType = Model<IReview, {}, ReviewDocumentOverrides>;

export const ReviewSchema = new Schema<IReview, ReviewModelType>({
  rating: Number,
  comment: String,
  customerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  dishId: { type: Schema.Types.ObjectId, required: true, ref: 'Food' },
  orderId: { type: Schema.Types.ObjectId, required: true, ref: 'Order' },
});

// makes sure each review record has a comment and/or rating, we cant have a review without both a rating AND a comment
ReviewSchema.pre<IReview>('save', function checkReviewComment(next): any {
  return this.rating && this.comment
    ? next()
    : 'cant save a review without a comment and/or rating';
});

const Review = model<IReview>('Review', ReviewSchema);

export default Review;
