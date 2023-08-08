import { Schema, model } from 'mongoose';
import { ICart } from '../types/interfaces';
import Food from './food';

const cartSchema = new Schema<ICart>({
  items: {
    type: [
      {
        quantity: { type: Number, min: [1, 'Quantity Must Atleast Be 1'] },
        dishId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
      },
    ],
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User',
  },
});

// A Document middleware to calculate the total price of the items in the cart before each save hook
cartSchema.pre<ICart>('save', async function calculateTotalPrice(this, next) {
  // if items array is empty, then by default totalPrice is 0, if items array is not empty then totalPrice will be updated inside the if condition
  this.totalPrice = 0;

  if (this.items?.length) {
    // Get all the dishIds from the items array
    const dishIds = this.items.map((item) => item.dishId);

    try {
      // Fetch all the dishes using the dishIds
      const dishes = await Food.find({ _id: { $in: dishIds } });

      // Calculate totalPrice based on the fetched dishes
      let totalPrice = 0;
      totalPrice = this.items.reduce((total, item) => {
        const dish = dishes.find((dishDoc) => dishDoc._id.equals(item.dishId));
        if (dish) {
          return total + dish.price * item.quantity;
        }
        return total;
      }, 0);

      // Update the totalPrice property in this instance of the cart document
      this.totalPrice = totalPrice;
    } catch (error) {
      // Handle any errors that occurred during the fetch
      throw new Error(error as string);
    }
  }

  // Call the next middleware or save the document if there are no items
  next();
});

const Cart = model<ICart>('Cart', cartSchema);
export default Cart;
