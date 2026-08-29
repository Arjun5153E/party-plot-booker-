import { Router } from 'express';
import {
  createReview,
  getVenueReviews,
  updateReview,
  deleteReview,
  addOwnerResponse,
  markHelpful
} from '../controllers/reviewController';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

router.get('/venue/:venueId', validate([
  param('venueId').isMongoId().withMessage('Invalid venue ID'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'rating.overall', 'helpfulCount']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
]), getVenueReviews);

router.post('/', protect, validate([
  body('venue').isMongoId().withMessage('Valid venue ID required'),
  body('booking').isMongoId().withMessage('Valid booking ID required'),
  body('rating.overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating 1-5 required'),
  body('rating.cleanliness').optional().isInt({ min: 1, max: 5 }),
  body('rating.service').optional().isInt({ min: 1, max: 5 }),
  body('rating.value').optional().isInt({ min: 1, max: 5 }),
  body('rating.location').optional().isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty().withMessage('Comment required'),
  body('images').optional().isArray()
]), createReview);

router.put('/:id', protect, validate([
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('rating.overall').optional().isInt({ min: 1, max: 5 }),
  body('rating.cleanliness').optional().isInt({ min: 1, max: 5 }),
  body('rating.service').optional().isInt({ min: 1, max: 5 }),
  body('rating.value').optional().isInt({ min: 1, max: 5 }),
  body('rating.location').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().notEmpty(),
  body('images').optional().isArray()
]), updateReview);

router.delete('/:id', protect, validate([
  param('id').isMongoId().withMessage('Invalid review ID')
]), deleteReview);

router.post('/:id/response', protect, authorize('venue_owner', 'admin'), validate([
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('message').trim().notEmpty().withMessage('Response message required')
]), addOwnerResponse);

router.post('/:id/helpful', protect, validate([
  param('id').isMongoId().withMessage('Invalid review ID')
]), markHelpful);

export default router;