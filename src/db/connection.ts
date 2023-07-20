import mongoose, { Collection, ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import { IUser } from '../types/interfaces';

dotenv.config();

const { DB_USERNAME, DB_PASSWORD } = process.env;

const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@home-taste-capstone.wyqdpan.mongodb.net/?retryWrites=true&w=majority`;

// Function to connect to MongoDB
export const connectToMongo = (): void => {
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const db = mongoose.connection;
  // Once the connection is open, log a success message
  db.once('open', () => {
    console.log('Database connected successfully...');
  });

  // If there's an error in the database connection, log the error message
  db.on('error', (err) => {
    console.error('Database connection error:', err);
  });
};

export const closeDbConnection = async () => {
  // await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

export const clearDatabase = async () => {
  const { collections } = mongoose.connection;

  // Dont use await in for loops, instead use Promise.all
  // Promise.all runs all the callbacks concurrently (almost in parallel), but using awaits in for loops will run the callbacks one after another
  // Deleting all the records in a collection isn't depenedant on any other collection, so we dont need to wait until one collection is deleted before deleting other collections
  // mongoose.mongo.DeleteResult is the promise type of the mongoose deleteMany() method
  const mongooseDeletePromises: Array<Promise<mongoose.mongo.DeleteResult>> =
    [];

  for (const key in collections) {
    mongooseDeletePromises.push(collections[key].deleteMany());
  }

  await Promise.all(mongooseDeletePromises);
};
