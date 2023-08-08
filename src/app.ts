import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as dotenv from 'dotenv';
import path from 'path';
import errorHandler from './middlewares/error-handling';

dotenv.config();

import routes from './routes';
import { connectToMongo } from './db/connection';
import SwaggerOptions from './utils/variables';
import './config/passport';

const app = express();
app.use(cookieParser(process.env.SECRET_KEY));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const swaggerSpec = swaggerJsdoc(SwaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.use('/api', routes);

app.use('*', errorHandler);

const port = process.env.NODE_LOCAL_PORT || 4000;

const server = app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await connectToMongo();
});

export default server;
