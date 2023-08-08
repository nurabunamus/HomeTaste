import request from 'supertest';
import jwt from 'jsonwebtoken';
import cookie from 'cookie-signature';
import server from '../../app';
import User from '../../models/user';
import { connectToMongo, closeDbConnection } from '../../db/connection';
import { IUser } from '../../types/interfaces';

beforeAll(async () => {
  await connectToMongo();
});

afterAll(async () => {
  await closeDbConnection();
  await server.close();
});

const mockToken = jwt.sign(
  { _id: '64b9781dbee12ba0fe169821', role: 'admin' },
  process.env.SECRET_KEY!
);
const signedToken = cookie.sign(mockToken, process.env.SECRET_KEY!);

const mockUser1: IUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  phone: '+905551234567',
  address: {
    streetName: 'Cooker Street',
    streetNumber: 123,
    flatNumber: 4,
    district: 'Cookerville',
    city: 'Cookstown',
    state: 'Cookerstate',
    zip: 12345,
  },
  profileImage: 'profile-image-url',
  role: 'cooker',
  paymentMethod: [
    {
      cardNumber: '1234567812345678',
      cardType: 'visa',
      cardCvv: 123,
      expirationDate: '12/24',
    },
  ],
  cookerStatus: 'active',
  paymentMethodStatus: true,
  isConfirmed: true,
  isRegistrationComplete: true,
  _id: '',
  providerId: '',
  fullName: '',
};

const mockUser2: IUser = {
  firstName: 'Nur',
  lastName: 'Abunamus',
  email: 'nurabunamus@gmail.com',
  password: 'password123',
  phone: '+905554234567',
  address: {
    streetName: 'Cooker Street',
    streetNumber: 123,
    flatNumber: 4,
    district: 'Cookerville',
    city: 'Cookstown',
    state: 'Cookerstate',
    zip: 12345,
  },
  profileImage: 'profile-image-url',
  role: 'customer',
  paymentMethod: [
    {
      cardNumber: '1234567812345678',
      cardType: 'visa',
      cardCvv: 123,
      expirationDate: '12/24',
    },
  ],
  cookerStatus: 'active',
  paymentMethodStatus: true,
  isConfirmed: true,
  isRegistrationComplete: true,
  _id: '',
  providerId: '',
  fullName: '',
};
const mockUserArray1: IUser[] = [mockUser1];
const mockUserArray2: IUser[] = [mockUser2];
const spy = jest.spyOn(User, 'find').mockResolvedValue(mockUserArray1);

describe('Admin Routes', () => {
  afterEach(() => {
    spy.mockReset();
  });

  describe('GET api/admin/cooker', () => {
    it('should return all users with the role cooker', async () => {
      spy.mockResolvedValueOnce(mockUserArray1);
      const res = await request(server)
        .get('/api/admin/cooker')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUserArray1);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when there are no users with the role cooker', async () => {
      spy.mockResolvedValueOnce([]);
      const res = await request(server)
        .get('/api/admin/cooker')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET api/admin/customers', () => {
    it('should return all users with the customer cooker', async () => {
      spy.mockResolvedValueOnce(mockUserArray2);
      const res = await request(server)
        .get('/api/admin/customers')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUserArray2);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when there are no users with the role cooker', async () => {
      spy.mockResolvedValueOnce([]);
      const res = await request(server)
        .get('/api/admin/cooker')
        .set('Cookie', [`authTokenCompleted=s%3A${signedToken}`]);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
