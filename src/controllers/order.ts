import { Request, Response } from 'express';
import Order from '../models/order';
import { IOrder, IUser } from '../types/interfaces';
import User from '../models/user';

const getOrders = async (req: Request, res: Response) => {
  try {
    // Get the user object from the request
    const userReq = req.user as IUser;
    const user = await User.findById({ _id: userReq._id });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
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
        name: `${user.first_name} ${user.last_name}`,
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
    const { orderDetails } = req.body as IOrder;

    // Check if the orderDetails are valid
    if (
      !orderDetails ||
      !Array.isArray(orderDetails) ||
      orderDetails.length === 0
    ) {
      return res.status(400).json({ message: 'Invalid order details' });
    }

    const user = await User.findById(userReq._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = new Order({
      orderDetails,
      user,
    });
    const newOrder = await order.save();

    return res
      .status(200)
      .json({ message: 'Order created successfully', data: newOrder });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default { createOrder, getOrders };
