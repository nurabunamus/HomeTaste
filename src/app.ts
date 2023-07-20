/* eslint-disable import/first */
/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as dotenv from 'dotenv';
import errorHandler from './middlewares/error-handling';

dotenv.config();

// eslint-disable-next-line import/first
import { connectToMongo } from './db/connection';
import SwaggerOptions from './utils/variables';
import './config/passport';
import routes from './routes';
import foodRouter from './routes/foods';

const app = express();
app.use(cookieParser(process.env.SECRET_KEY));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());

const swaggerSpec = swaggerJsdoc(SwaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.use('/api', routes);
app.use('/api', foodRouter);

app.use('*', errorHandler);

const port = process.env.NODE_LOCAL_PORT || 4000;

const server = app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await connectToMongo();
});

export default server;
