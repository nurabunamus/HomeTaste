import { Types } from 'mongoose';

interface IAddress {
  street_name: string;
  street_number: number;
  flat_number: number;
  district: string;
  city: string;
  state: string;
  zip: number;
}

interface IPaymentMethod {
  card_number: string;
  card_type: string;
  card_cvv: number;
  expiration_date: string;
}

interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  address: IAddress;
  profile_image: string;
  role: string;
  payment_method: Array<IPaymentMethod>;
  cooker_status: string;
  provider_id: string;
  payment_method_status: boolean;
  fullName: string;
}

interface IFood {
  user_id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  categories: string;
  allergies: string;
}

interface ICart {
  items: { quantity: number; dishId: Types.ObjectId }[];
  totalPrice: number;
  user: Types.ObjectId;
}

interface IOrder {
  orderDetails: { quantity: number; dishId: Types.ObjectId }[];
  orderStatus: string;
  user: IUser;
}

interface IReview {
  rating: number;
  comment: string;
  userId: Types.ObjectId;
  dishId: Types.ObjectId;
  order: IOrder;
}

export { IAddress, IPaymentMethod, IUser, IFood, ICart, IOrder, IReview };
