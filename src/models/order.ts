import { Schema, Types, model, Model } from 'mongoose';
import { IUser, UserSchema } from './user';

enum OrderStatus {
  Pending,
  Approved,
  Preparing,
  'On The Way',
  Delivered,
}

type OrderDetails = { quantity: number; dishId: Types.ObjectId };

type OrdersDocumentOverrides = {
  user: Types.Subdocument<Types.ObjectId> & IUser;
};

interface IOrders {
  orderDetails: OrderDetails[];
  orderStatus: String;
  user: IUser;
}

//check the mongoose typescript documentation for more info
//https://mongoosejs.com/docs/typescript/subdocuments.html
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

export const Order = model<IOrders>('Orders', orderSchema);
