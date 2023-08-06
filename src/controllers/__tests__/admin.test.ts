/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable node/no-extraneous-import */
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
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  phone: '+905551234567',
  address: {
    street_name: 'Cooker Street',
    street_number: 123,
    flat_number: 4,
    district: 'Cookerville',
    city: 'Cookstown',
    state: 'Cookerstate',
    zip: 12345,
  },
  profile_image: 'profile-image-url',
  role: 'cooker',
  payment_method: [
    {
      card_number: '1234567812345678',
      card_type: 'visa',
      card_cvv: 123,
      expiration_date: '12/24',
    },
  ],
  cooker_status: 'active',
  payment_method_status: true,
  isConfirmed: true,
  isRegistrationComplete: true,
  _id: '',
  provider_id: '',
  fullName: '',
};

const mockUser2: IUser = {
  first_name: 'Nur',
  last_name: 'Abunamus',
  email: 'nurabunamus@gmail.com',
  password: 'password123',
  phone: '+905554234567',
  address: {
    street_name: 'Cooker Street',
    street_number: 123,
    flat_number: 4,
    district: 'Cookerville',
    city: 'Cookstown',
    state: 'Cookerstate',
    zip: 12345,
  },
  profile_image: 'profile-image-url',
  role: 'customer',
  payment_method: [
    {
      card_number: '1234567812345678',
      card_type: 'visa',
      card_cvv: 123,
      expiration_date: '12/24',
    },
  ],
  cooker_status: 'active',
  payment_method_status: true,
  isConfirmed: true,
  isRegistrationComplete: true,
  _id: '',
  provider_id: '',
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
