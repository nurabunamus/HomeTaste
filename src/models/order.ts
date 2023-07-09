import { Schema, Types, model, Model } from 'mongoose';
import { IUser, UserSchema } from './user';

// wrting On_The_Way as "On The Way" gives an eslint error, which is why its written like this here
enum OrderStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Preparing = 'Preparing',
  On_The_Way = 'On The Way',
  Delivered = 'Delivered',
}

type OrderDetails = { quantity: number; dishId: Types.ObjectId };

type OrdersDocumentOverrides = {
  user: Types.Subdocument<Types.ObjectId> & IUser;
};

export interface IOrders {
  orderDetails: OrderDetails[];
  orderStatus: string;
  user: IUser;
}

/* check the mongoose typescript documentation for more info
 https://mongoosejs.com/docs/typescript/subdocuments.html */
type OrdersModelType = Model<IOrders, {}, OrdersDocumentOverrides>;

export const orderSchema = new Schema<IOrders, OrdersModelType>({
  orderDetails: {
    type: [
      {
        quantity: { type: Number, min: [1, 'Quantity Must Atleast Be 1'] },
        dishId: Schema.Types.ObjectId,
      },
    ],
  },
  orderStatus: {
    type: String,
    default: OrderStatus.Pending,
    enum: Object.values(OrderStatus),
    required: true,
  },
  user: UserSchema,
});

const Order = model<IOrders>('Order', orderSchema);

export default Order;
