/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import authRoutes from './auth';
import userRoutes from './users';

import passwordResetRoutes from './passwordReset';

import foodRouter from './foods';
import cookerRouter from './cookers';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/auth', passwordResetRoutes);

router.use('/user', userRoutes);
router.use('/foods', foodRouter);
router.use('/cooker', cookerRouter);

export default router;
