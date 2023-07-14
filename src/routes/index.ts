/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import authRoutes from './auth';

const router = express.Router();

router.use('/auth', authRoutes);

export default router;
