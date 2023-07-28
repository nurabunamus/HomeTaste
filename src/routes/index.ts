/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import reviewRouter from './review';

import passwordResetRoutes from './passwordReset';

import foodRouter from './foods';
import cookerRouter from './cookers';
import cartRoutes from './cart';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/auth', passwordResetRoutes);

router.use('/user', userRoutes);
router.use('/foods', foodRouter);
router.use('/cooker', cookerRouter);
router.use('/cart', cartRoutes);
router.use('/review', reviewRouter);
export default router;
