/* eslint-disable node/no-unsupported-features/es-syntax */
import mongoose, { ConnectOptions } from 'mongoose';

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

export const closeDatabase = async () => {
  // await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

export const clearDatabase = async () => {
  const { collections } = mongoose.connection;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in collections) {
    // eslint-disable-next-line no-await-in-loop
    await collections[key].deleteMany();
  }
};
