// eslint-disable-next-line node/no-unsupported-features/es-syntax, node/no-unpublished-import
import request from 'supertest';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import app from '../../app';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import Food from '../../models/food';
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { connectToMongo, closeDbConnection } from '../../db/connection';

beforeAll(async () => {
  await connectToMongo();
});

afterAll(async () => {
  await closeDbConnection();
});

const foodOne = {
  _id: '60f7ea20b5d7c23d4c4d5f98',
  user_id: '60f7ea20b5d7c23d4c4d5f97',
  name: 'Pizza Margherita',
  description: 'Classic pizza with tomato sauce, mozzarella, and basil',
  price: 10,
  image: 'https://example.com/pizza.jpg',
  categories: ['Pizza', 'Italian'],
  allergies: ['Dairy', 'Gluten'],
};

beforeEach(async () => {
  await Food.create(foodOne);
});

afterEach(async () => {
  // eslint-disable-next-line no-underscore-dangle
  await Food.deleteOne({ _id: foodOne._id });
});

test('Should get food by id', async () => {
  const response = await request(app)
    // eslint-disable-next-line no-underscore-dangle
    .get(`/api/foods/${foodOne._id}`)
    .send()
    .expect(200);

  expect(response.body).toMatchObject({
    // eslint-disable-next-line no-underscore-dangle
    _id: foodOne._id,
    user_id: foodOne.user_id,
    name: foodOne.name,
    description: foodOne.description,
    price: foodOne.price,
    image: foodOne.image,
    categories: foodOne.categories,
    allergies: foodOne.allergies,
  });
});

test('Should return 404 if food not found', async () => {
  await request(app)
    .get('/api/foods/60f7ea20b5d7c23d4c4d5f99')
    .send()
    .expect(404);
});
