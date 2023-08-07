import cookie from 'cookie-signature';
import request from 'supertest';
import jwt from 'jsonwebtoken';
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
// Set the authentication token to an empty string or any invalid value
const invalidToken = cookie.sign(mockToken, 'abc');
// To get user profile
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '05340718124',
  address: {
    city: 'Test City',
    country: 'Test Country',
  },
  profileImage: 'profile.jpg',
  cookerStatus: '',
};
const spy = jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

// To update user profile
const updateUserData = {
  firstName: 'John',
  lastName: 'Doe',
  phone: '+905340718124',
  cookerStatus: '',
  streetName: 'Main Street',
  streetNumber: '123',
  city: 'New York',
  state: 'NY',
  flatNumber: 'Apt 1',
  district: 'Central',
  zip: '12345',
  profileImage: '/image.jpg',
};
const findOneAndUpdateSpy = jest.spyOn(User, 'findOneAndUpdate');
findOneAndUpdateSpy.mockResolvedValue(updateUserData);

describe('User Routes', () => {
  afterEach(() => {
    spy.mockReset();
    findOneAndUpdateSpy.mockClear();
  });

  describe('GET/api/users/profile', () => {
    it('Should get the user profile', async () => {
      const res = await request(server)
        .get('/api/users/profile')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User retrieved successfully');
      expect(res.body.data).toEqual(mockUser);
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it('should return a 401 error when the user is not authenticated', async () => {
      const res = await request(server).get('/api/users/profile');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token, Unauthorized.');
      expect(spy).not.toHaveBeenCalled();
    });
    it('should return a 404 error when the user is not found', async () => {
      // Mock User.findById to return null, indicating that the user is not found
      spy.mockResolvedValueOnce(null);

      const res = await request(server)
        .get('/api/users/profile')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it('should return a 500 error when an internal server error occurs', async () => {
      // Mock User.findById to throw an error, simulating an internal server error
      spy.mockRejectedValueOnce(new Error('Database connection failed'));

      const res = await request(server)
        .get('/api/users/profile')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH/api/users/profile/edit', () => {
    it('should update the user profile', async () => {
      const res = await request(server)
        .patch('/api/users/profile/edit')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`])
        .send(updateUserData);
      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('Profile updated successfully!');
      expect(res.body.data).toEqual(updateUserData);
      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
    });
    it('should return a 401 error when updating the profile without proper authentication', async () => {
      const res = await request(server)
        .patch('/api/users/profile/edit')
        .set('Cookie', [`authTokenCompleted=s%3A${invalidToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token, Unauthorized.');
    });
    it('should return a 404 error when the user is not found when updating the profile', async () => {
      findOneAndUpdateSpy.mockResolvedValueOnce(null);
      const res = await request(server)
        .patch('/api/users/profile/edit')
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
        .patch('/api/users/profile/edit')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
