import { Document, Types, Schema, model } from 'mongoose';

enum Categories {
  // add your categories here
}

enum Allergies {
  // add your allergies here
}

interface IFood extends Document {
  user_id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  categories: string;
  allergies: string;
}

const foodSchema = new Schema<IFood>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  description: { type: String, maxlength: 256},
  price: {
    type: Number,
    validate: {
      validator: function (value: number) {
        return value > 0;
      },
      message: 'Price must be a positive number',
    },
  },
  image: String,
  categories: { type: String, enum: Object.values(Categories) },
  allergies: { type: String, enum: Object.values(Allergies) },
});


const Food = model<IFood>('Food', foodSchema);
