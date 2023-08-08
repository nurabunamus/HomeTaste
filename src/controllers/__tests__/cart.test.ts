import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookie from 'cookie-signature';
import server from '../../app';
import Cart from '../../models/cart';
import { connectToMongo, closeDbConnection } from '../../db/connection';
import Food from '../../models/food';

dotenv.config();

beforeAll(async () => {
  await connectToMongo();
});

afterAll(async () => {
  await closeDbConnection();
  server.close();
});

const firstMockItem = {
  quantity: 1,
  dishId: '64c515f494e860d59451717c',
  cookerId: {
    cookerStatus: 'active',
  },
};
const secondMockItem = {
  quantity: 1,
  dishId: '64c515f494e860d59451719c',
};

const deleteItemCart = {
  _id: '64b9794d6e69a32c5b952b2e',
  totalPrice: 0,
  user: '64b9781dbee12ba0fe169821',
  items: [secondMockItem],
  __v: 0,
  save: jest.fn(),
};

const updatedCart = {
  _id: '64b9794d6e69a32c5b952b2e',
  totalPrice: 0,
  user: '64b9781dbee12ba0fe169821',
  items: [firstMockItem, secondMockItem],
  __v: 0,
  save: jest.fn(),
};

const firstMockCartWithSave = {
  _id: '64b9794d6e69a32c5b952b2e',
  totalPrice: 0,
  user: '64b9781dbee12ba0fe169821',
  items: [firstMockItem],
  __v: 0,
  save: jest.fn(),
};

const emptyCart = {
  _id: '64b9794d6e69a32c5b952b2e',
  totalPrice: 0,
  user: '64b9781dbee12ba0fe169821',
  items: [],
  __v: 0,
  save: jest.fn(),
};

const secondMockCartWithSave = {
  _id: '64a9794d6f69a32d5b952f2e',
  totalPrice: 0,
  user: '64b9781dbee12ba0fe169820',
  items: [],
  __v: 0,
  save: jest.fn(),
};

const mockCartWithNoSave = {
  _id: '64b9794d6e69a32c5b952b2e',
  totalPrice: 0,
  user: '64b9781dbee12ba0fe169821',
  items: [firstMockItem],
  __v: 0,
};

const mockUserCarts = [firstMockCartWithSave, secondMockCartWithSave];

// for testing /cart endpoints, We only need the user id and role in the mock jwt payload
const mockToken = jwt.sign(
  { _id: '64b9781dbee12ba0fe169821', role: 'customer' },
  process.env.SECRET_KEY!
);

const signedToken = cookie.sign(mockToken, process.env.SECRET_KEY!);

// instead of perfoming an API request to the database, we can just mock the findOne method of the mongoose Cart model instead.
const spyCartFind = jest
  .spyOn(Cart, 'findOne')
  .mockImplementation(() => mockUserCarts[0] as any);

const spyFoodFind = jest
  .spyOn(Food, 'find')
  .mockReturnValue({ distinct: jest.fn().mockReturnValue([1]) } as any);

const spyFoodFindById = jest.spyOn(Food, 'findById').mockReturnValue({
  populate: jest.fn().mockReturnValue(firstMockItem),
} as any);

describe('Cart Routes', () => {
  afterEach(() => {
    spyCartFind.mockClear();
    firstMockCartWithSave.save.mockClear();
    spyFoodFind.mockClear();
    spyFoodFindById.mockClear();
  });

  describe('GET /cart', () => {
    it("Should  Get The User's Cart", async () => {
      const res = await request(server)
        .get('/api/cart')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCartWithNoSave);
      expect(spyCartFind).toHaveBeenCalledTimes(1);

      expect(spyCartFind.mock.results[0].value._id).toBe(
        firstMockCartWithSave._id
      );
    });

    it('Should Not Get The Cart Of Another User', async () => {
      const res = await request(server)
        .get('/api/cart')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(spyCartFind).toHaveBeenCalledTimes(1);
      expect(res.body).not.toEqual(mockUserCarts[1]);
    });
  });
  describe('POST /cart', () => {
    it('Should Add A New Item To The Cart', async () => {
      const res = await request(server)
        .post('/api/cart')
        .query({ dishId: '64c515f494e860d59451719c' })
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(spyFoodFindById).toBeCalledTimes(1);
      expect(spyFoodFind).toBeCalledTimes(1);
      expect(JSON.stringify(firstMockCartWithSave)).toEqual(
        JSON.stringify(updatedCart)
      );
      expect(spyCartFind).toBeCalledTimes(1);
      expect(firstMockCartWithSave.save).toBeCalledTimes(1);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Dish Succesfully Added To Cart');
    });
  });

  describe('DELETE /cart', () => {
    it('Removes An Item From The Cart', async () => {
      const res = await request(server)
        .delete('/api/cart/')
        .query({ dishId: '64c515f494e860d59451717c' })
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(spyCartFind).toBeCalledTimes(1);
      expect(firstMockCartWithSave.save).toBeCalledTimes(1);
      expect(JSON.stringify(firstMockCartWithSave)).toEqual(
        JSON.stringify(deleteItemCart)
      );
      expect(res.status).toBe(204);
    });
  });
  describe('PUT /cart', () => {
    it('Should Update the quantity of an item in the cart', async () => {
      const res = await request(server)
        .put('/api/cart/')
        .query({ dishId: '64c515f494e860d59451719c', method: 'increment' })
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(spyCartFind).toBeCalledTimes(1);
      expect(firstMockCartWithSave.save).toBeCalledTimes(1);
      expect(firstMockCartWithSave.items[0].quantity).toBe(2);
      expect(res.status).toBe(201);
      expect(res.body).toBe('Quantity Succesfully Updated');
    });
  });
  describe('GET /cart/deleteAll', () => {
    it('Removes All Items From The Users Cart', async () => {
      const res = await request(server)
        .get('/api/cart/deleteAll')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(firstMockCartWithSave.save).toBeCalledTimes(1);
      expect(spyCartFind).toBeCalledTimes(1);
      expect(JSON.stringify(firstMockCartWithSave)).toEqual(
        JSON.stringify(emptyCart)
      );
      expect(res.status).toBe(200);
      expect(res.body).toBe(
        'All Items In The Cart Have Been Succesfully Removed'
      );
    });
  });
});
