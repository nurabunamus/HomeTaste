import { Request, Response } from 'express';
import Order, { OrderStatus } from '../models/order';
import { IOrder, IUser } from '../types/interfaces';
import User from '../models/user';
import Cart from '../models/cart';

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
      orderStatus: order.orderStatus,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
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
    const { cookerId } = req.body as IOrder;

    // Check if the provided cookerId belongs to a user with the role "cooker"
    const cooker = await User.findById(cookerId);
    if (!cooker || cooker.role !== 'cooker') {
      return res.status(403).json({ message: 'User is not a cooker' });
    }

    // Find the user associated with the authenticated user ID
    const user = await User.findById(userReq._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the user's cart in the database
    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return res.status(404).json({ message: 'No cart found for this user' });
    }

    const newOrder = await Order.create({
      orderDetails: cart.items,
      user,
      cookerId,
    });

    // Clear the cart items after the order is successfully created
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save;

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
      orderStatus: order.orderStatus,
      user: {
        first_name: order.user.first_name,
        last_name: order.user.last_name,
        email: order.user.email,
        phone: order.user.phone,
        address: order.user.address,
      },
    };
    return res
      .status(200)
      .json({ message: 'Order canceled successfully', data: formattedOrder });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default { createOrder, getOrders, cancelOrder };
