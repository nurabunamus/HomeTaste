import { Types, Document } from 'mongoose';

interface IAddress {
  streetName: string;
  streetNumber: number;
  flatNumber: number;
  district: string;
  city: string;
  state: string;
  zip: number;
}

interface IPaymentMethod {
  cardNumber: string;
  cardType: string;
  cardCvv: number;
  expirationDate: string;
}

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: IAddress;
  profileImage: string;
  role: string;
  paymentMethod: Array<IPaymentMethod>;
  cookerStatus: string;
  providerId: string;
  paymentMethodStatus: boolean;
  fullName: string;
  isConfirmed: boolean;
  isRegistrationComplete: boolean;
}

interface IFood extends Document {
  cookerId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  categories: string[];
  allergies: string[];
}

interface ICart {
  items?: { quantity: number; dishId: Types.ObjectId }[];
  totalPrice?: number;
  customerId: Types.ObjectId;
}

interface IOrder {
  orderDetails: { quantity: number; dishId: Types.ObjectId }[];
  totalPrice: number;
  orderStatus: string;
  customer: IUser;
  cookerId: Types.ObjectId;
}

interface IReview extends Document {
  rating: number;
  comment: string;
  customerId: Types.ObjectId;
  dishId: Types.ObjectId;
  orderId: Types.ObjectId;
}

interface IPasswordResetToken {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
}

export {
  IAddress,
  IPaymentMethod,
  IUser,
  IFood,
  ICart,
  IOrder,
  IReview,
  IPasswordResetToken,
};
