import { Schema, Types, model } from 'mongoose';
import { ICart } from '../types/interfaces';

const cartSchema = new Schema<ICart>({
  items: {
    type: [
      {
        quantity: { type: Number, min: [1, 'Quantity Must Atleast Be 1'] },
        dishId: Schema.Types.ObjectId,
        required: true,
        ref: 'Food',
      },
    ],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User',
  },
});

/* The following code is a Document Middleware to check if the total price is less than 0, 
Document Middlewares have a "this" object which points to the document itself
the "this" object must have the same type as the interface of the schema, in this case, the interface here is ICart */
cartSchema.pre('save', function (this: ICart): any {
  return this.totalPrice >= 0
    ? this.totalPrice
    : new Error('Total Price Cant Be Less Than 0...');
});

export default model<ICart>('Cart', cartSchema);
