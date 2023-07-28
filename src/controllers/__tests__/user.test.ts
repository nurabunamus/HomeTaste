/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-extraneous-import */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-underscore-dangle */
/* eslint-disable spaced-comment */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import cookie from 'cookie-signature';
import server from '../../app';
import User from '../../models/user';
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

//To get user profile
const mockUser = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '05340718124',
  address: {
    city: 'Test City',
    country: 'Test Country',
  },
  profile_image: 'profile.jpg',
  cooker_status: '',
};
const spy = jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

//To update user profile
const userData = {
  first_name: 'John',
  last_name: 'Doe',
  phone: '+905340718124',
  cooker_status: '',
  street_name: 'Main Street',
  street_number: '123',
  city: 'New York',
  state: 'NY',
  flat_number: 'Apt 1',
  district: 'Central',
  zip: '12345',
  profile_image: '/image.jpg',
};
const findOneAndUpdateSpy = jest.spyOn(User, 'findOneAndUpdate');
findOneAndUpdateSpy.mockResolvedValue(userData);

describe('User Routes', () => {
  afterEach(() => {
    spy.mockReset();
    findOneAndUpdateSpy.mockClear();
  });

  describe('GET/api/user/profile', () => {
    it('Should get the user profile', async () => {
      const res = await request(server)
        .get('/api/user/profile')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User retrieved successfully');
      expect(res.body.data).toEqual(mockUser);
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it('should return a 401 error when the user is not authenticated', async () => {
      const res = await request(server).get('/api/user/profile');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token, Unauthorized.');
      expect(spy).not.toHaveBeenCalled();
    });
    it('should return a 404 error when the user is not found', async () => {
      // Mock User.findById to return null, indicating that the user is not found
      spy.mockResolvedValueOnce(null);

      const res = await request(server)
        .get('/api/user/profile')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it('should return a 500 error when an internal server error occurs', async () => {
      // Mock User.findById to throw an error, simulating an internal server error
      spy.mockRejectedValueOnce(new Error('Database connection failed'));

      const res = await request(server)
        .get('/api/user/profile')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH/api/user/profile/edit', () => {
    it('should update the user profile', async () => {
      const res = await request(server)
        .patch('/api/user/profile/edit')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send(userData);
      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('Profile updated successfully!');
      expect(res.body.data).toEqual(userData);
      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
    });
    it('should return a 401 error when updating the profile without proper authentication', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        phone: '+905340718124',
      };
      const res = await request(server)
        .patch('/api/user/profile/edit')
        .set('Cookie', [`authTokenCompleted=some_invalid_token`])
        .send(userData);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token, Unauthorized.');
    });
    it('should return a 404 error when the user is not found when updating the profile', async () => {
      findOneAndUpdateSpy.mockResolvedValueOnce(null);
      const res = await request(server)
        .patch('/api/user/profile/edit')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
    });
    it('should return a 500 error when an internal server error occurs updating the profile', async () => {
      findOneAndUpdateSpy.mockRejectedValueOnce(
        new Error('Database connection failed')
      );
      const res = await request(server)
        .patch('/api/user/profile/edit')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
