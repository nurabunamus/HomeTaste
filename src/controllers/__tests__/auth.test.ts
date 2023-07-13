import request from 'supertest';
import app from '../../app';
import User from '../../models/user';

afterEach(async () => {
  await User.deleteMany({});
});

describe('Register1 tasks', () => {
  test('registers a new user successfully', async () => {
    const newUser = {
      fullName: 'Jamil Doe',
      email: 'jamildoe@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/register1')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User successfully signed up');
    expect(response.body.user).toBeDefined();

    const { id, fullName, email } = response.body.user;
    expect(id).toBeDefined();
    expect(fullName).toBe(newUser.fullName);
    expect(email).toBe(newUser.email);

    const user = await User.findOne({ email: newUser.email });
    expect(user).toBeDefined();
    expect(user?.fullName).toBe(newUser.fullName);
    expect(user?.email).toBe(newUser.email);

    // Check if the token cookie is set
    const cookies = response.header['set-cookie'];
    expect(cookies).toBeDefined();
    const authTokenCookie = cookies.find((cookie: string) =>
      cookie.includes('auth_token')
    );
    expect(authTokenCookie).toBeDefined();
  });

  test('handles missing fields', async () => {
    const newUser = {
      fullName: 'John Doe',
      email: '',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/register1')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields');
  });
});
