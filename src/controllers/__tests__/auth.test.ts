import request from 'supertest';
import app from '../../app';
import { connectToMongo, closeDbConnection } from '../../db/connection';
import User from '../../models/user';

beforeAll(async () => {
  await connectToMongo();
});

afterAll(async () => {
  await closeDbConnection();
  app.close();
});

const mockUser = {
  email: 'test222@example.com',
  password: 'password123',
  fullName: 'John Doe',
  __v: 0,
  save: jest.fn(),
};

const spyUserFind = jest.spyOn(User, 'findOne').mockReturnValue({} as any);

describe('Auth Routes', () => {
  afterEach(() => {
    spyUserFind.mockClear();
  });

  describe('POST api/auth/register1', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register1').send(mockUser);
      expect(spyUserFind).toBeCalledTimes(1);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User successfully signed up');
    });
  });
});
