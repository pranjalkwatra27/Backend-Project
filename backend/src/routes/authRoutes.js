import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, demoLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';

const router = express.Router();

// Validation chains for register
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['candidate', 'recruiter']).withMessage('Role must be candidate or recruiter'),
  validate,
];

// Validation chains for login
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);

export default router;
