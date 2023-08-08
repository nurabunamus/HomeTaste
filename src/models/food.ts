import { Schema, model } from 'mongoose';
import { IFood } from '../types/interfaces';

// dont use strings as keys or eslint will cause an error, just assign a key to a string instead
enum Categories {
  Pizza = 'Pizza',
  Doner = 'Doner',
  Cig_Kofte = 'Çiğ Köfte',
  Dessert = 'Dessert',
  Turkish = 'Turkish',
  Chicken = 'Chicken',
  Fast_Food = 'Fast Food',
  Burger = 'Burger',
  Kumpir = 'Kumpir',
  Meat = 'Meat',
  Italian = 'Italian',
  Healthy = 'Healthy/Diet',
  Drinks = 'Drinks',
  Far_East = 'Far East',
  Vegan = 'Vegan',
  Keto = 'Keto',
}

// dont use strings as keys or eslint will cause an error, just assign a key to a string instead
enum Allergies {
  Dairy = 'Dairy',
  Eggs = 'Eggs',
  Seafood = 'Seafood',
  Gluten = 'Gluten',
  Peanuts = 'Peanuts',
  Soy = 'Soy',
  Sesame = 'Sesame',
  Corn = 'Corn',
  Meat = 'Meat',
  Chicken = 'Chicken',
  Potatoes = 'Potatoes',
  Rice = 'Rice',
  Oats = 'Oats',
  Barley = 'Barley',
  Rye = 'Rye',
  Sorghum = 'Sorghum',
}

const foodSchema = new Schema<IFood>(
  {
    cookerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    description: { type: String, maxlength: 256 },
    price: {
      type: Number,
      required: true,
      validate: {
        validator(value: number) {
          return value > 0;
        },
        message: 'Price must be a positive number',
      },
    },
    image: { type: String, required: true },
    categories: [{ type: String, enum: Object.values(Categories) }],
    allergies: [{ type: String, enum: Object.values(Allergies) }],
  },
  { timestamps: true }
);

const Food = model<IFood>('Food', foodSchema);
export default Food;
