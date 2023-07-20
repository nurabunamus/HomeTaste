/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import authRoutes from './auth';
import foodRouter from './foods';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/foods', foodRouter);

export default router;
