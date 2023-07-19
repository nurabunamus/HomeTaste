/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable node/no-unpublished-import */
import request from 'supertest';
import server from '../../app';
import {
  connectToMongo,
  closeDatabase,
  clearDatabase,
} from '../../db/connection';

const newUser = {
  fullName: 'Jamil Doe',
  email: 'jamildoe@example.com',
  password: 'password123',
};

afterAll(async () => {
  await closeDatabase();
  server.close();
});

beforeAll(async () => {
  await connectToMongo();
});

describe('Auth Routes', () => {
  beforeEach(async () => {
    await request(server).post('/api/auth/register1').send(newUser);
  }, 10000); // Set the timeout to 10000 ms (10 seconds)

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /register1', () => {
    test('If any of required fields are not passed, should return an error with status code 400', async () => {
      // note that only "fullName" property is passed
      const mReqBody = {
        fullName: 'Cengiz',
      };

      const res = await request(server)
        .post('/api/auth/register1')
        .send(mReqBody);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
      expect(res.headers['content-type']).toMatch('application/json');
    }, 10000);

    test('If user email exists, should return an error with status code 400', async () => {
      const res = await request(server)
        .post('/api/auth/register1')
        .send(newUser);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists');
      expect(res.headers['content-type']).toMatch('application/json');
    });

    test('If user data is valid, should create a user, return its data with status code 201', async () => {
      const mValidRequest = {
        fullName: 'Nur Abunamus',
        email: 'example@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        fullName: 'Nur Abunamus',
        email: 'example@example.com',
      };

      const res = await request(server)
        .post('/api/auth/register1')
        .send(mValidRequest);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User successfully signed up');
      expect(res.headers['content-type']).toMatch('application/json');
      expect(res.body.user).toEqual(expect.objectContaining(expectedResponse));
    });
  });

  describe('POST /register2', () => {
    test('If any of required fields are not passed, should return an error with status code 400', async () => {
      // note that only "fullName" property is passed
      const mReqBody = {
        role: 'customer',
      };

      const res = await request(server)
        .post('/api/auth/register2')
        .send(mReqBody);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
      expect(res.headers['content-type']).toMatch('application/json');
    });
  });

  describe('POST /login', () => {
    test('If any of required fields are not passed, should return an error with status code 400', async () => {
      // note that no fields are passed
      const mReqBody = {};

      const res = await request(server).post('/api/auth/login').send(mReqBody);
      expect(res.status).toBe(400);
      expect(res.headers['content-type']).toMatch('application/json');
    });

    test('If user email does not exist, should return an error with status code 404', async () => {
      const mReq = {
        email: 'xyz@mail.com',
        password: 'xyz123',
      };

      const expectedResponse = {
        error: 'User not found, please register',
      };

      const res = await request(server).post('/api/auth/login').send(mReq);
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch('application/json');
      expect(res.body).toEqual(expect.objectContaining(expectedResponse));
    });

    test('If password is incorrect, should return an error with status code 401', async () => {
      const mReq = {
        email: 'jamildoe@example.com',
        password: 'cbA12345',
      };

      const expectedResponse = {
        error: 'Invalid credentials',
      };

      const res = await request(server).post('/api/auth/login').send(mReq);
      expect(res.status).toBe(401);
      expect(res.headers['content-type']).toMatch('application/json');
      expect(res.body).toEqual(expect.objectContaining(expectedResponse));
    });

    test('If user credentials are valid, put token into cookie and return with status code 200', async () => {
      const mReq = {
        email: 'jamildoe@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        message: 'User successfully logged in',
      };

      const res = await request(server).post('/api/auth/login').send(mReq);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch('application/json');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('auth_token');
      expect(res.body).toEqual(expect.objectContaining(expectedResponse));
    });
  });
});
