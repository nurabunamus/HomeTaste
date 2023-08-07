import request from 'supertest';
import jwt from 'jsonwebtoken';
import cookie from 'cookie-signature';
import server from '../../app';
import Order from '../../models/order';
import User from '../../models/user';
import Cart from '../../models/cart';
import Food from '../../models/food';
import { connectToMongo, closeDbConnection } from '../../db/connection';

beforeAll(async () => {
  await connectToMongo();
});

afterAll(async () => {
  await closeDbConnection();
  await server.close();
});
// To create a token
const mockToken = jwt.sign(
  { _id: '64b9781dbee12ba0fe169821', role: 'customer' },
  process.env.SECRET_KEY!
);
const signedToken = cookie.sign(mockToken, process.env.SECRET_KEY!);
// Set the authentication token to an empty string or any invalid value
const invalidToken = cookie.sign(mockToken, 'abc');

const mockUser = {
  _id: '64b9781dbee12ba0fe169821',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '05340718124',
  address: {
    city: 'Test City',
    country: 'Test Country',
  },
};
const userSpy = jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

const mockOrder = {
  _id: '64b9781dbee12ba0fe169877',
  orderDetails: [
    {
      quantity: 1,
      dishId: '64b9781dbee12ba0fe169888',
    },
  ],
  totalPrice: 10,
  orderStatus: 'Pending',
  customer: mockUser,
  cookerId: '64b9781dbee12ba0fe169899',
};
const orderSpy = jest.spyOn(Order, 'find').mockResolvedValue([mockOrder]);

describe('Order Routes', () => {
  afterEach(() => {
    orderSpy.mockReset();
    userSpy.mockReset();
  });

  describe('Get /api/orders/', () => {
    it('should return a 200 with user orders in formatted response', async () => {
      const res = await request(server)
        .get('/api/orders')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(' Orders successfully retrieved');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toEqual([mockOrder]);
      expect(orderSpy).toHaveBeenCalledTimes(1);
      expect(userSpy).toHaveBeenCalledTimes(1);
    });
    it('should return a 404 error if the user is not found', async () => {
      orderSpy.mockRejectedValueOnce([null]);
      const res = await request(server)
        .get('/api/orders')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
      expect(userSpy).toHaveBeenCalledTimes(1);
    });
    it('should return a 401 error if user is not authenticated', async () => {
      const res = await request(server)
        .get('/api/orders')
        .set('Cookie', [`authTokenCompleted=s%3A${invalidToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token, Unauthorized.');
      expect(User.findById).not.toHaveBeenCalled();
    });
  });

  describe('Put /api/orders/:id/cancel', () => {
    it('should return a 200 and update the order status to be canceled', async () => {
      const mockUpdateOrder = {
        _id: mockOrder._id,
        orderDetails: [
          {
            quantity: 1,
            dishId: '64b9781dbee12ba0fe169888',
          },
        ],
        totalPrice: 10,
        orderStatus: 'Canceled',
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          address: {
            city: 'Test City',
            country: 'Test Country',
          },
        },
        cookerId: '64b9781dbee12ba0fe169899',
      };
      const userFindByIdMock = jest.spyOn(User, 'findById');
      userFindByIdMock.mockResolvedValue({ _id: '64b9781dbee12ba0fe169821' });

      const orderFindAndUpdateMock = jest.spyOn(Order, 'findByIdAndUpdate');
      orderFindAndUpdateMock.mockResolvedValue(mockUpdateOrder);
      const res = await request(server)
        .put(`/api/orders/64b9781dbee12ba0fe169877/cancel`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Order canceled successfully');
      expect(res.body.data).toEqual(mockUpdateOrder);
      expect(userFindByIdMock).toHaveBeenCalledTimes(1);
      expect(orderFindAndUpdateMock).toHaveBeenCalledTimes(1);
    });
    it('should return a 404 error  if user is not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      const res = await request(server)
        .put(`/api/orders/64b9781dbee12ba0fe169877/cancel`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
    it('should return a 401 error if user is not authenticated', async () => {
      const res = await request(server)
        .put(`/api/orders/64b9781dbee12ba0fe169877/cancel`)
        .set('Cookie', [`authTokenCompleted=s%3A${invalidToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token, Unauthorized.');
      expect(User.findById).not.toHaveBeenCalled();
    });
  });

  describe('Post /api/orders/create', () => {
    it('should return a 200 and create a new order successfully', async () => {
      const mockUserToCreateOrder = {
        _id: '64b9781dbee12ba0fe169821',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '05340718124',
        address: {
          city: 'Test City',
          country: 'Test Country',
        },
      };
      const mockFood = {
        _id: '64ca2f92892c25849663e947',
        cookerId: '64c9ffd01853c9f2f69f7045',
        price: 5,
      };
      const mockCart = {
        _id: '64b9781dbee12ba0fe169823',
        items: [{ quantity: 2, dishId: '64ca2f92892c25849663e947' }],
        totalPrice: 10,
        save: jest.fn(),
        set: jest.fn(),
      };
      const findUserSpy = jest
        .spyOn(User, 'findById')
        .mockResolvedValue(mockUserToCreateOrder as any);
      const findCartSpy = jest
        .spyOn(Cart, 'findOne')
        .mockResolvedValue(mockCart as any);
      const findFoodSpy = jest
        .spyOn(Food, 'findById')
        .mockResolvedValue(mockFood as any);

      const newOrder = {
        _id: '64b9781dbee12ba0fe169877',
        orderDetails: [
          {
            quantity: 1,
            dishId: '64b9781dbee12ba0fe169888',
          },
        ],
        totalPrice: 10,
        orderStatus: 'Pending',
        customer: mockUserToCreateOrder,
        cookerId: '64b9781dbee12ba0fe169899',
      };

      jest.spyOn(Order, 'create').mockResolvedValue(newOrder as any);

      const res = await request(server)
        .post('/api/orders/create')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(findCartSpy).toBeCalledTimes(1);
      expect(findFoodSpy).toBeCalledTimes(1);
      expect(findUserSpy).toBeCalledTimes(1);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Order created successfully');
      expect(res.body.data).toEqual(newOrder);
    });
    it('should return a 404 error  if user is not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      const res = await request(server)
        .post('/api/orders/create')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
    it('should return a 404 error if cart is not found for the user', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue({});
      jest.spyOn(Cart, 'findOne').mockResolvedValue(null);

      const res = await request(server)
        .post('/api/orders/create')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('No cart found for this user');
    });
    it('should return a 401 error if user is not authenticated', async () => {
      const res = await request(server)
        .post('/api/orders/create')
        .set('Cookie', [`authTokenCompleted=s%3A${invalidToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token, Unauthorized.');
      expect(User.findById).not.toHaveBeenCalled();
    });
  });
});
