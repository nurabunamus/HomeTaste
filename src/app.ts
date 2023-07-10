import express from 'express';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
dotenv.config();

import connectToMongo from '../src/db/connection';
import routes from './routes';

const app = express();
app.use(cookieParser(process.env.SECRET_KEY));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api', routes);

const port = process.env.NODE_LOCAL_PORT || 4000;

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await connectToMongo();
});

export default app;
