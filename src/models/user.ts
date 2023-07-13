import { Document, Schema, model } from 'mongoose';
import { IUser } from '../types/interfaces';

const AddressSchema = new Schema({
  street_name: { type: String, required: true, maxlength: 150 },
  street_number: { type: Number, required: true, maxlength: 150 },
  flat_number: { type: Number, required: true, maxlength: 150 },
  district: { type: String, required: true, maxlength: 150 },
  city: { type: String, required: true, maxlength: 150 },
  state: { type: String, required: true, maxlength: 150 },
  zip: { type: Number, required: true, maxlength: 150 },
});

const PaymentMethodSchema = new Schema({
  card_number: String,
  card_type: String,
  card_cvv: Number,
  expiration_date: String,
});

const UserSchema = new Schema(
  {
    first_name: { type: String, required: true, minlength: 3, maxlength: 15 },
    last_name: { type: String, required: true, minlength: 3, maxlength: 15 },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) => {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid email address!`,
      },
    },
    password: { type: String, minlength: 8 },
    phone: {
      type: String,
      minlength: 5,
      maxlength: 15,
      validate: {
        validator: (value: string) => {
          const phoneRegex = /^\+90(5\d{2})(\d{3})(\d{2})(\d{2})$/;
          return phoneRegex.test(value);
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid Turkish phone number!`,
      },
      unique: true,
      sparse: true,
    },
    address: { type: AddressSchema },
    profile_image: { type: String },
    role: {
      type: String,
      enum: ['admin', 'cooker', 'customer'],
    },
    payment_method: { type: [PaymentMethodSchema] },
    chief_status: { type: String },
    provider_id: { type: String, unique: true, sparse: true },
    payment_method_status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.virtual('fullName')
  .get(function (this: IUser) {
    return `${this.first_name} ${this.last_name}`;
  })
  .set(function (fullName: string) {
    const [firstName, lastName] = fullName.split(' ');
    this.set('first_name', firstName);
    this.set('last_name', lastName);
  });

const User = model<IUser>('User', UserSchema);
export default User;
