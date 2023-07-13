/* eslint-disable import/first */
/* eslint-disable node/no-unsupported-features/es-syntax */
import cookieParser from 'cookie-parser';
import passport from 'passport';
import express from 'express';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

// eslint-disable-next-line import/first
import connectToMongo from './db/connection';
import googleAuth from './routes/google';
import SwaggerOptions from './utils/variables';
import './config/passport';

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

app.use('/api/auth', googleAuth);

const port = process.env.NODE_LOCAL_PORT || 4000;

app.listen(port, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
  await connectToMongo();
});

export default app;
