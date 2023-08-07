import request from 'supertest';
import bcrypt from 'bcrypt';
import server from '../../app';
import { connectToMongo, closeDbConnection } from '../../db/connection';
import User from '../../models/user';

beforeAll(async () => {
  await connectToMongo();
});

afterAll(async () => {
  await closeDbConnection();
  server.close();
});

const mockUser = {
  _id: '12343325454254245',
  email: 'test5@example.com',
  password: 'password123',
  fullName: 'John Doe',
};

const mockLoginUser = {
  email: 'test99@example.com',
  password: 'password123',
};

const user = {
  _id: 'valid_user_id_here',
};

const spyUserFind1 = jest.spyOn(User, 'findOne').mockReturnValue({} as any);
const spyUserCreate = jest
  .spyOn(User, 'create')
  .mockReturnValue(mockUser as any);

const spyBycrypt = jest
  .spyOn(bcrypt, 'compare')
  .mockImplementation(() => Promise.resolve(true));

describe('Auth Routes', () => {
  afterEach(() => {
    spyUserFind1.mockClear();
    spyBycrypt.mockClear();
  });

  describe('POST api/auth/register1', () => {
    it('should register a new user', async () => {
      const res = await request(server)
        .post('/api/auth/register1')
        .send(mockUser);
      expect(spyUserFind1).toBeCalledTimes(1);
      expect(spyUserCreate).toBeCalledTimes(1);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User successfully signed up');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(server).post('/api/auth/register1').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    it('should return 409 if user already exists', async () => {
      const spyUserFind2 = jest
        .spyOn(User, 'findOne')
        .mockResolvedValueOnce(mockUser);
      const res = await request(server)
        .post('/api/auth/register1')
        .send(mockUser);
      expect(spyUserFind2).toBeCalledTimes(1);
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('User already exists');
    });
  });

  describe('POST api/auth/login', () => {
    it('should return 200 if login is successful', async () => {
      const spyUserFindLogin = jest
        .spyOn(User, 'findOne')
        .mockReturnValue(mockLoginUser as any);
      jest.spyOn(User, 'findOne').mockResolvedValue(user);

      const res = await request(server)
        .post('/api/auth/login')
        .send(mockLoginUser);
      expect(spyUserFindLogin).toBeCalledTimes(1);
      expect(spyBycrypt).toBeCalledTimes(1);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User successfully logged in');
    });

    it('should return 400 if email or password is missing', async () => {
      const res = await request(server).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    it('should return 404 if user is not found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
      const res = await request(server)
        .post('/api/auth/login')
        .send(mockLoginUser);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found, please register');
    });

    it('should return 404 if user is signed in with Google', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce({
        email: 'googleuser@example.com',
        providerId: 'google123',
      });
      const res = await request(server)
        .post('/api/auth/login')
        .send(mockLoginUser);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe(
        'Use the appropriate method for login, Google or Facebook'
      );
    });
  });
});
