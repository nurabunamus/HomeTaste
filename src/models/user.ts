import { Schema, model } from 'mongoose';
import { IUser, IAddress, IPaymentMethod } from '../types/interfaces';

const AddressSchema = new Schema<IAddress>({
  streetName: { type: String, required: true, maxlength: 150 },
  streetNumber: { type: Number, required: true, maxlength: 150 },
  flatNumber: { type: Number, required: true, maxlength: 150 },
  district: { type: String, required: true, maxlength: 150 },
  city: { type: String, required: true, maxlength: 150 },
  state: { type: String, required: true, maxlength: 150 },
  zip: { type: Number, required: true, maxlength: 150 },
});

const PaymentMethodSchema = new Schema<IPaymentMethod>({
  cardNumber: String,
  cardType: String,
  cardCvv: Number,
  expirationDate: String,
});

export const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minlength: 3, maxlength: 15 },
    lastName: { type: String, required: true, minlength: 3, maxlength: 15 },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) => {
          /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
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
    profileImage: { type: String },
    role: {
      type: String,
      enum: ['admin', 'cooker', 'customer'],
    },
    paymentMethod: [PaymentMethodSchema],
    cookerStatus: { type: String, default: 'active' },
    providerId: { type: String, unique: true, sparse: true },
    paymentMethodStatus: {
      type: Boolean,
      default: false,
    },
    isConfirmed: { type: Boolean, default: false },
    isRegistrationComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.virtual('fullName')
  .get(function getFullName() {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function setFullName(fullName: string) {
    const [firstName, lastName] = fullName.split(' ');
    this.set('firstName', firstName);
    this.set('lastName', lastName);
  });

const User = model<IUser>('User', UserSchema);
export default User;
