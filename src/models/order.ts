import { Schema, Types, model, Model } from 'mongoose';
import { IUser, IOrder } from '../types/interfaces';
import { UserSchema } from './user';

// wrting On_The_Way as "On The Way" gives an eslint error, which is why its written like this here
export enum OrderStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Preparing = 'Preparing',
  On_The_Way = 'On The Way',
  Delivered = 'Delivered',
  Canceled = 'Canceled',
}

type OrdersDocumentOverrides = {
  user: Types.Subdocument<Types.ObjectId> & IUser;
};

/* check the mongoose typescript documentation for more info
 https://mongoosejs.com/docs/typescript/subdocuments.html */
type OrdersModelType = Model<IOrder, object, OrdersDocumentOverrides>;

export const orderSchema = new Schema<IOrder, OrdersModelType>({
  orderDetails: {
    type: [
      {
        quantity: {
          type: Number,
          min: [1, 'Quantity Must Atleast Be 1'],
          required: true,
        },
        dishId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
      },
    ],
  },
  totalPrice: {
    type: Number,
  },
  orderStatus: {
    type: String,
    default: OrderStatus.Pending,
    enum: Object.values(OrderStatus),
    required: true,
  },
  customer: UserSchema,
  cookerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Order = model<IOrder>('Order', orderSchema);

export default Order;
