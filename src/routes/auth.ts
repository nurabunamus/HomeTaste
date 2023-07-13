import express from 'express';
const router = express.Router();

const authController = require('../controllers/auth');

router.post('/register1', authController.register1);
router.post('/register2', authController.completedRegister);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

export default router;
