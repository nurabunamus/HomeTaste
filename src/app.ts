import express, { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv';
dotenv.config();
import errorHandler from './middlewares/error-handling';
import testError from './errors/testError';
import connectToMongo from '../src/db/connection';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  throw new testError('This route is not exist please use valid route!', `the route: ${req.url}`)
  res.send('hi im home page!')
})

app.use('*', errorHandler)

const port = process.env.NODE_LOCAL_PORT || 4000;

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await connectToMongo();
});

export default app;
