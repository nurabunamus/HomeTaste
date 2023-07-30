import { Schema, model } from 'mongoose';
import { ICart } from '../types/interfaces';

const cartSchema = new Schema<ICart>({
  items: {
    type: [
      {
        quantity: { type: Number, min: [1, 'Quantity Must Atleast Be 1'] },
        dishId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
      },
    ],
  },
  totalPrice: {
    type: Number,
    default: 0,
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
  return this.totalPrice! >= 0
    ? this.totalPrice
    : new Error('Total Price Cant Be Less Than 0...');
});

cartSchema.post<ICart>('save', async function (this, next: any) {
  const userCart = await Cart.findOne({ user: this.user }).populate(
    'items.dishId',
    'price'
  );
  userCart!.totalPrice = userCart!.items?.reduce(
    (accumlator: any, initialVal: any) =>
      accumlator + initialVal.quantity * initialVal.dishId.price,
    0
  );
  await userCart?.save();
  next();
});

const Cart = model<ICart>('Cart', cartSchema);
export default Cart;
