import { Document, Types, Schema, model } from 'mongoose';

enum Categories {
  "Pizza",
  "Doner",
  "Çiğ Köfte",
  "Dessert",
  "Tantuni",
  "Kokorec",
  "Chicken",
  "Waffle",
  "Burger",
  "Rice",
  "Ice Cream",
  "Kumpir",
  "Meatballs",
  "Pasta",
  "Home-Made Cuisine",
  "Salad",
  "Coffee",
  "Far East",
  "Steak",
  "Çiğ Börek"
}

enum Allergies {
  "Milk",
  "Eggs",
  "Fish",
  "Tree nuts",
  "Peanuts",
  "Wheat",
  "Soy",
  "Sesame",
  "Corn",
  "Beef",
  "Chicken",
  "Potatoes",
  "Rice",
  "Oats",
  "Barley",
  "Rye",
  "Sorghum"
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
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  description: { type: String, maxlength: 256},
  price: {
    type: Number,
    required: true,
    validate: {
      validator: function (value: number) {
        return value > 0;
      },
      message: 'Price must be a positive number',
    },
  },
  image: { type: String, required: true },
  categories: { type: String, enum: Object.values(Categories) },
  allergies: { type: String, enum: Object.values(Allergies) },
}, { timestamps: true });


const Food = model<IFood>('Food', foodSchema);
export default Food;
