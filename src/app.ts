import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectToMongo from '../src/db/connection';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const port = process.env.NODE_LOCAL_PORT || 4000;

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await connectToMongo();
});

export default app;
