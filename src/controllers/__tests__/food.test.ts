import request from 'supertest';
import dotenv from 'dotenv';
import server from '../../app';
import Food from '../../models/food';
import { connectToMongo, closeDbConnection } from '../../db/connection';

dotenv.config();

beforeAll(async () => {
  await connectToMongo();
});

afterAll(async () => {
  await closeDbConnection();
  await server.close();
});

const foodId = '60f7ea20b5d7c23d4c4d5f98';
const mockFood = {
  _id: foodId,
  name: 'Pizza Margherita',
  description: 'Classic pizza with tomato sauce, mozzarella, and basil',
  price: 10,
  image: 'https://example.com/pizza.jpg',
  categories: ['Pizza', 'Italian'],
  allergies: [],
};

describe('Food API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/foods/{foodId}', () => {
    test('should return food item with given ID', async () => {
      jest.spyOn(Food, 'findById').mockResolvedValueOnce(mockFood);

      const response = await request(server).get(`/api/foods/${foodId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFood);
    });

    test('should return 404 if food item not found', async () => {
      jest.spyOn(Food, 'findById').mockResolvedValueOnce(null);

      const response = await request(server).get(`/api/foods/${foodId}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Food not found');
    });
  });

  describe('GET /api/foods', () => {
    test('should return all food items if no filters specified', async () => {
      const mockFoods = [
        {
          _id: '60f7ea20b5d7c23d4c4d5f98',
          name: 'Pizza Margherita',
          description: 'Classic pizza with tomato sauce, mozzarella, and basil',
          price: 10,
          image: 'https://example.com/pizza.jpg',
          categories: ['Pizza', 'Italian'],
          allergies: [],
        },
        {
          _id: '60f7ea20b5d7c23d4c4d5f99',
          name: 'Doner Kebab',
          description: 'Delicious doner kebab with fresh vegetables and sauce',
          price: 8,
          image: 'https://example.com/doner.jpg',
          categories: ['Doner', 'Turkish'],
          allergies: ['Gluten'],
        },
      ];
      jest.spyOn(Food, 'find').mockResolvedValueOnce(mockFoods);

      const response = await request(server).get('/api/foods');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFoods);
    });

    test('should return filtered food items if filters specified', async () => {
      const mockFoods = [
        {
          _id: '60f7ea20b5d7c23d4c4d5f98',
          name: 'Pizza Margherita',
          description: 'Classic pizza with tomato sauce, mozzarella, and basil',
          price: 10,
          image: 'https://example.com/pizza.jpg',
          categories: ['Pizza', 'Italian'],
          allergies: [],
        },
      ];
      jest.spyOn(Food, 'find').mockResolvedValueOnce(mockFoods);

      const response = await request(server)
        .get('/api/foods')
        .query({ categories: 'Pizza,Italian' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFoods);
    });
  });
});
