import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

router.post('/register', validate([
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('role').optional().isIn(['user', 'venue_owner']).withMessage('Invalid role')
]), register);

router.post('/login', validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
]), login);

router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate([
  body('name').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('address.street').optional().isString(),
  body('address.city').optional().isString(),
  body('address.state').optional().isString(),
  body('address.zipCode').optional().isString()
]), updateProfile);
router.put('/password', protect, validate([
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
]), updatePassword);
router.post('/forgot-password', validate([
  body('email').isEmail().withMessage('Valid email required')
]), forgotPassword);
router.post('/reset-password', validate([
  body('token').notEmpty().withMessage('Token required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), resetPassword);

export default router;