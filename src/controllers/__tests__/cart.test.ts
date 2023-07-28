/* eslint-disable node/no-extraneous-import */
import jwt from 'jsonwebtoken';
import request from 'supertest';
import dotenv from 'dotenv';
import cookie from 'cookie-signature';
import app from '../../app';
import Cart from '../../models/cart';
import {
  connectToMongo,
  closeDbConnection,
  clearDatabase,
} from '../../db/connection';

dotenv.config();

beforeAll(async () => {
  await connectToMongo();
});

afterAll(async () => {
  await closeDbConnection();
  app.close();
});

const firstMockedUserCart = {
  _id: '64b9794d6e69a32c5b952b2e',
  totalPrice: 0,
  user: '64b9781dbee12ba0fe169821',
  items: [],
  __v: 0,
};

const secondMockedUserCart = {
  _id: '64a9794d6f69a32d5b952f2e',
  totalPrice: 0,
  user: '64b9781dbee12ba0fe169820',
  items: [],
  __v: 0,
};

const mockUserCarts = [firstMockedUserCart, secondMockedUserCart];

// for testing /cart endpoints, We only need the user id and role in the mock jwt payload
const mockToken = jwt.sign(
  { _id: '64b9781dbee12ba0fe169821', role: 'customer' },
  process.env.SECRET_KEY!
);

const signedToken = cookie.sign(mockToken, process.env.SECRET_KEY!);

// instead of perfoming an API request to the database, we can just mock the findOne method of the mongoose Cart model instead.
const spy = jest
  .spyOn(Cart, 'findOne')
  .mockReturnValueOnce(firstMockedUserCart as any);

describe('Cart Routes', () => {
  afterEach(() => {
    spy.mockReset();
  });

  describe('GET /cart', () => {
    it("Should  Get The User's Cart", async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUserCarts[0]);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.results[0].value._id).toBe(firstMockedUserCart._id);
    });

    it('Should Not Get The Cart Of Another User', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(res.body).not.toEqual(mockUserCarts[1]);
    });
  });
});
