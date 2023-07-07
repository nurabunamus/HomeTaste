import { Document, Schema, model } from 'mongoose';

interface IAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

// interface IPaymentMethod {
//   card_number: string;
//   card_type: string;
//   expiration_date: string;
// }

interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  address: IAddress;
  profile_image: string;
  role: string;
//   payment_method: Array<IPaymentMethod>;
  cooker_status: string;
//   payment_method_status: boolean;
}

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
});

// const PaymentMethodSchema = new Schema({
//   card_number: { type: String, required: true },
//   card_type: { type: String, required: true },
//   expiration_date: { type: String, required: true },
// });

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
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
  phone: { type:String, required:true },
  address: { type:AddressSchema, required:true },
  profile_image: { type:String, required:true },
  role: { type:String, required:true },
//   payment_method: { type:[PaymentMethodSchema], required:true },
  cooker_status: { type:String },
  provider_id: { type:String },
//   payment_method_status: { type:Boolean, required:true }
});

const User = model<IUser>('User', UserSchema);
export default User;