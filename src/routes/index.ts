/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import authRoutes from './auth';
import passwordResetRoutes from './passwordReset';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/auth', passwordResetRoutes);

export default router;
