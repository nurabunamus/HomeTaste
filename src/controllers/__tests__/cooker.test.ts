import jwt from 'jsonwebtoken';
import request from 'supertest';
import dotenv from 'dotenv';
import cookie from 'cookie-signature';
import { UpdateWriteOpResult } from 'mongoose';
import server from '../../app';
import Food from '../../models/food';
import User from '../../models/user';

import { connectToMongo, closeDbConnection } from '../../db/connection';
import Order from '../../models/order';

dotenv.config();

beforeAll(async () => {
  await connectToMongo();
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await closeDbConnection();
  await server.close();
});

const cookerId = '64c9ffd01853c9f2f69f7045';
const dishId = '64cb7503cf820c93b8b8e5f2';
const deleteObj: any = {};

const mockFood = [
  {
    _id: '60f7ea20b5d7c23d4c4d5f98',
    name: 'Pizza Margherita',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 10,
    image: 'https://example.com/pizza.jpg',
    categories: ['Pizza', 'Italian'],
    allergies: [],
  },
];

const mockDishes = [
  {
    _id: '60f7ea20b5d7c23d4c4d5f98',
    name: 'Pizza Margherita',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 10,
    image: 'https://example.com/pizza.jpg',
    categories: ['Pizza', 'Italian'],
    allergies: [],
  },
];

const updatedDish = {
  name: 'Pizza Margherita',
  description: 'Classic pizza with tomato sauce, mozzarella, and basil',
  price: 30,
  image: 'https://example.com/pizza.jpg',
  categories: ['Kumpir', 'Drinks'],
  allergies: ['Peanuts'],
};

const mockUpdateResult: UpdateWriteOpResult = {
  acknowledged: true,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0,
  upsertedId: null,
};

const mockPendingOrder = {
  _id: '64ca51f6d860a0478ee0766e',
  cookerId,
  orderStatus: 'Pending',
  save: jest.fn(),
};

const mockToken = jwt.sign(
  { _id: '64b9781dbee12ba0fe169821', role: 'customer' },
  process.env.SECRET_KEY!
);

const mockCookToken = jwt.sign(
  { _id: mockPendingOrder.cookerId, role: 'cooker' },
  process.env.SECRET_KEY!
);
const signedToken = cookie.sign(mockToken, process.env.SECRET_KEY!);
const signedCookToken = cookie.sign(mockCookToken, process.env.SECRET_KEY!);

describe('Cooker API', () => {
  describe('GET /api/cooker/{cookerId}/dishes', () => {
    test('should return dishes for given cookerId', async () => {
      jest.spyOn(Food, 'find').mockResolvedValueOnce(mockDishes);

      const response = await request(server).get(
        `/api/cooker/${cookerId}/dishes`
      );
      expect(response.status).toBe(200);
      expect(response.body.data.dishes).toEqual(mockDishes);
    });

    test('should return 500 if an error occurs while retrieving dishes', async () => {
      jest
        .spyOn(Food, 'find')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await request(server).get(
        `/api/cooker/${cookerId}/dishes`
      );
      expect(response.status).toBe(500);
      expect(response.body.message).toBe(
        'An error occurred while retrieving the dishes'
      );
    });
  });

  describe('DELETE /api/cooker/{cookerId}/{dishId}', () => {
    test('should delete dish with given cookerId and dishId', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'cooker' });
      jest.spyOn(Food, 'findOne').mockResolvedValueOnce(mockFood);
      jest.spyOn(Food, 'deleteOne').mockResolvedValueOnce(deleteObj);

      const response = await request(server)
        .delete(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Dish deleted successfully');
    });

    test('should return 404 if user not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce(null);

      const response = await request(server)
        .delete(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    test('should return 403 if user is not a cooker', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'customer' });

      const response = await request(server)
        .delete(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('User is not a cooker');
    });

    test('should return 404 if dish not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'cooker' });
      jest.spyOn(Food, 'findOne').mockResolvedValueOnce(null);

      const response = await request(server)
        .delete(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Dish not found');
    });

    test('should return 500 if an error occurs while deleting dish', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'cooker' });
      jest.spyOn(Food, 'findOne').mockResolvedValueOnce(mockFood);
      jest
        .spyOn(Food, 'deleteOne')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await request(server)
        .delete(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe(
        'An error occurred while deleting the dish'
      );
    });
  });
  describe('PUT /api/cooker/{cookerId}/{dishId}', () => {
    test('should update dish with given cookerId and dishId', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'cooker' });
      jest
        .spyOn(Food, 'findOne')
        .mockResolvedValueOnce({ _id: '64cb7503cf820c93b8b8e5f2' });
      jest.spyOn(Food, 'updateOne').mockResolvedValueOnce(mockUpdateResult);

      const response = await request(server)
        .put(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send(updatedDish);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Dish updated successfully');
    });

    test('should return 403 if user is not a cooker', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'customer' });

      const response = await request(server)
        .put(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send({});
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('User is not a cooker');
    });

    test('should return 404 if user not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce(null);

      const response = await request(server)
        .put(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send({});
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    test('should return 404 if dish not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'cooker' });
      jest.spyOn(Food, 'findOne').mockResolvedValueOnce(null);

      const response = await request(server)
        .put(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send({});
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Dish not found');
    });

    test('should return 500 if an error occurs while updating dish', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'cooker' });
      jest
        .spyOn(Food, 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await request(server)
        .put(`/api/cooker/${cookerId}/${dishId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send({});
      expect(response.status).toBe(500);
      expect(response.body.message).toBe(
        'An error occurred while updating the dish'
      );
    });
  });
  describe('POST /api/cooker/{cookerId}/dish', () => {
    const customerId = '64c9ffd01853c9f2f69f7045';
    const nonExistentUserId = '64c9ffd01853c9f2f69f7045';

    test('should create a new dish for the given cookerId', async () => {
      const dishData: any = {
        name: 'Pizza Margherita',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 10,
        image: 'example.com',
        categories: ['Pizza', 'Italian'],
        allergies: ['Gluten', 'Dairy'],
      };

      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'cooker' });
      jest.spyOn(Food, 'create').mockResolvedValueOnce(dishData);

      const response = await request(server)
        .post(`/api/cooker/${cookerId}/dish`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .field(dishData)
        .attach('image', 'test_imgs/food.png');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Dish created successfully');
      expect(response.body.data.dish).toMatchObject(dishData);
    });

    test('should return 403 if user is not a cooker', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({ role: 'customer' });

      const response = await request(server)
        .post(`/api/cooker/${customerId}/dish`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('User is not a cooker');
    });

    test('should return 404 if user not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce(null);

      const response = await request(server)
        .post(`/api/cooker/${nonExistentUserId}/dish`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });
  describe('PATCH /cooker/orders/changeStatus', () => {
    it('Should Update The Order Status Succesfully', async () => {
      const orderSpy = jest
        .spyOn(Order, 'findOne')
        .mockReturnValueOnce(mockPendingOrder as any);

      const res = await request(server)
        .patch('/api/cooker/orders/changeStatus')
        .query({
          orderId: mockPendingOrder._id,
          orderStatus: mockPendingOrder.orderStatus,
        })
        .set('Cookie', [`authTokenCompleted=s%3A${signedCookToken}`]);

      expect(orderSpy).toBeCalledTimes(1);
      expect(res.status).toBe(201);
      expect(res.body).toBe(
        `Order Status Succesfully Updated To ${mockPendingOrder.orderStatus} `
      );
    });
  });
});
