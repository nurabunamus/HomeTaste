import jwt from 'jsonwebtoken';
import request from 'supertest';
import dotenv from 'dotenv';
import cookie from 'cookie-signature';
import server from '../../app';
import Review from '../../models/review';
import { connectToMongo, closeDbConnection } from '../../db/connection';

dotenv.config();

beforeAll(async () => {
  await connectToMongo();
});

afterAll(async () => {
  await closeDbConnection();
  await server.close();
});

const foodId = '60f7ea20a8b1c72f9a56c3f4';
const review1 = {
  _id: '60f7ea20a8b1c72f9a56c3f5',
  rating: 4,
  comment: 'Delicious!',
  userId: '60f7ea20a8b1c72f9a56c3f2',
  dishId: foodId,
  order: '60f7ea20a8b1c72f9a56c3f3',
};

const review2 = {
  _id: '60f7ea20a8b1c72f9a56c3f6',
  rating: 5,
  comment: 'Amazing!',
  customerId: '60f7ea20a8b1c72f9a56c3f2',
  dishId: foodId,
  orderId: '60f7ea20a8b1c72f9a56c3f3',
};

const mockToken = jwt.sign(
  { _id: '64b9781dbee12ba0fe169821', role: 'customer' },
  process.env.SECRET_KEY!
);

const signedToken = cookie.sign(mockToken, process.env.SECRET_KEY!);

const mockFind = jest
  .spyOn(Review, 'find')
  .mockResolvedValueOnce([review1, review2]);

describe('Review Routes', () => {
  afterEach(async () => {
    mockFind.mockReset();
  });

  describe('GET /:foodId/reviews', () => {
    it('should retrieve all reviews for a food item', async () => {
      // Make the request
      const res = await request(server)
        .get(`/api/review/${foodId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.reviews).toHaveLength(2);
      expect(res.body.reviews[0]._id).toEqual(review1._id);
      expect(res.body.reviews[1]._id).toEqual(review2._id);

      mockFind.mockRestore();
    });
  });
  describe('POST /review/:foodId', () => {
    it('should create a new review for a food item', async () => {
      const reviewData = {
        rating: 4,
        comment: 'Delicious!',
        customerId: '60f7ea20a8b1c72f9a56c3f2',
        orderId: '60f7ea20a8b1c72f9a56c3f3',
      };

      const mockSave = jest
        .spyOn(Review.prototype, 'save')
        .mockImplementationOnce(function (this: any) {
          this._id = '60f7ea20a8b1c72f9a56c3f5';
          return Promise.resolve(this);
        });

      const res = await request(server)
        .post(`/api/review/${foodId}`)
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send(reviewData);

      expect(res.status).toBe(201);
      expect(res.body.message).toEqual('Review created successfully');
      expect(res.body.review.rating).toEqual(reviewData.rating);
      expect(res.body.review.comment).toEqual(reviewData.comment);
      expect(res.body.review.customerId).toEqual(reviewData.customerId);
      expect(res.body.review.dishId).toEqual(foodId);
      expect(res.body.review.orderId).toEqual(reviewData.orderId);

      mockSave.mockRestore();
    });
  });
});
