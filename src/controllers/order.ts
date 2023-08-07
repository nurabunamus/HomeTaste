import { Request, Response } from 'express';
import Order, { OrderStatus } from '../models/order';
import { IUser } from '../types/interfaces';
import User from '../models/user';
import Cart from '../models/cart';
import Food from '../models/food';

const getOrders = async (req: Request, res: Response) => {
  try {
    // Get the user object from the request
    const userReq = req.user as IUser;
    const user = await User.findById({ _id: userReq._id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Find all orders associated with the user
    const orders = await Order.find({ 'user._id': user._id });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    // Format the orders data to make the response more concise and readable
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderDetails: order.orderDetails,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
      cookerId: order.cookerId,
    }));

    return res.status(200).json({
      message: ' Orders successfully retrieved',
      data: formattedOrders,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const userReq = req.user as IUser;
    // Find the user associated with the authenticated user ID
    const user = await User.findById(userReq._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Find the user's cart in the database
    const cart = await Cart.findOne({ customerId: user._id });
    if (!cart) {
      return res.status(404).json({ message: 'No cart found for this user' });
    }
    // Check if the cart has at least one item
    if (!cart.items || cart.items.length === 0) {
      return res.status(404).json({ error: 'Cart is empty' });
    }
    // Get the first item in the cart
    const firstCartItem = cart.items[0];

    // Check if the first item has a dishId
    if (!firstCartItem || !firstCartItem.dishId) {
      return res
        .status(404)
        .json({ error: 'No dishId found in the first item of the cart' });
    }
    // Extract the dishId from the first item in the cart
    const dishId = firstCartItem.dishId.toString();
    const food = await Food.findById({ _id: dishId });
    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    const cookerId = food?.cookerId;

    const newOrder = await Order.create({
      orderDetails: cart.items,
      totalPrice: cart.totalPrice,
      user,
      cookerId,
    });

    // Clear the cart items after the order is successfully created
    cart.set({ items: [] });
    await cart.save();

    return res
      .status(200)
      .json({ message: 'Order created successfully', data: newOrder });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const cancelOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const userReq = req.user as IUser;

    const user = await User.findById({ _id: userReq._id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: OrderStatus.Canceled },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Format the orders data to make the response more concise and readable
    const formattedOrder = {
      _id: order._id,
      orderDetails: order.orderDetails,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      user: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        email: order.user.email,
        phone: order.user.phone,
        address: order.user.address,
      },
      cookerId: order.cookerId,
    };
    return res
      .status(200)
      .json({ message: 'Order canceled successfully', data: formattedOrder });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default { createOrder, getOrders, cancelOrder };
