import express from 'express';
const router = express.Router();

const authController = require('../controllers/auth');

router.post('/register1', authController.register1);
router.post('/register2', authController.register2);

export default router;
