import { Document, Schema, model } from 'mongoose';

interface IAddress {
  street_name: string;
  street_number: number;
  flat_number: number
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

interface IUser extends Document {
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
  payment_method_status: boolean;
}

const AddressSchema = new Schema({
  street_name: { type: String, required: true, maxlength:150 },
  street_number: { type: Number, required: true, maxlength:150 },
  flat_number: { type: Number, required: true, maxlength:150 },
  district: { type: String, required: true, maxlength:150 },
  city: { type: String, required: true, maxlength:150 },
  state: { type: String, required: true, maxlength:150 },
  zip: { type: Number, required: true, maxlength:150 },
});

const PaymentMethodSchema = new Schema({
  card_number: String,
  card_type: String,
  card_cvv: Number,
  expiration_date: String,
});

const UserSchema = new Schema({
  first_name: { type: String, required: true, minlength: 3, maxlength: 15 },
  last_name: { type: String, required: true, minlength: 3, maxlength: 15 },
  email: {
    type: String,
    required: true,
    unique:true,
    validate:{
      validator:(value: string)=>{
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
      },
      message:(props: {value: string } )=>`${props.value} is not a valid email address!`
    }
  },
  password: { type:String, required:true, minlength:8 },
  phone: {
    type: String,
    required: true,
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
  },
  address: { type: AddressSchema, required:true },
  profile_image: { type: String, required:true },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'cooker', 'customer'],
  },
  payment_method: { type:[PaymentMethodSchema] },
  chief_status: { type: String },
  provider_id: { type: String },
  payment_method_status: Boolean
}, { timestamps: true });

UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.first_name} ${this.last_name}`;
});

const User = model<IUser>('User', UserSchema);
export default User;