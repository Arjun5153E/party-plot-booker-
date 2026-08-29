import { Router } from 'express';
import {
  getVenues,
  getVenue,
  createVenue,
  updateVenue,
  deleteVenue,
  getMyVenues,
  checkAvailability,
  getNearbyVenues,
  toggleFavorite
} from '../controllers/venueController';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body, query, param } from 'express-validator';

const router = Router();

router.get('/', optionalAuth, validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('minCapacity').optional().isInt({ min: 1 }).toInt(),
  query('maxCapacity').optional().isInt({ min: 1 }).toInt(),
  query('lat').optional().isFloat().toFloat(),
  query('lng').optional().isFloat().toFloat(),
  query('radius').optional().isInt({ min: 1000 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'pricing.basePrice', 'rating.average', 'name']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
]), getVenues);

router.get('/nearby', validate([
  query('lat').isFloat().withMessage('Latitude required').toFloat(),
  query('lng').isFloat().withMessage('Longitude required').toFloat(),
  query('radius').optional().isInt({ min: 1000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
]), getNearbyVenues);

router.get('/my-venues', protect, authorize('venue_owner', 'admin'), getMyVenues);

router.get('/:id', optionalAuth, validate([
  param('id').isMongoId().withMessage('Invalid venue ID')
]), getVenue);

router.post('/', protect, authorize('venue_owner', 'admin'), validate([
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('capacity.min').isInt({ min: 1 }).withMessage('Minimum capacity required'),
  body('capacity.max').isInt({ min: 1 }).withMessage('Maximum capacity required'),
  body('pricing.basePrice').isFloat({ min: 0 }).withMessage('Base price required'),
  body('pricing.priceType').optional().isIn(['hourly', 'daily', 'event']),
  body('location.address').trim().notEmpty().withMessage('Address required'),
  body('location.city').trim().notEmpty().withMessage('City required'),
  body('location.state').trim().notEmpty().withMessage('State required'),
  body('location.zipCode').trim().notEmpty().withMessage('Zip code required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates required [lng, lat]'),
  body('amenities').optional().isArray(),
  body('images').optional().isArray(),
  body('rules').optional().isArray(),
  body('cancellationPolicy').optional().isIn(['flexible', 'moderate', 'strict'])
]), createVenue);

router.put('/:id', protect, authorize('venue_owner', 'admin'), validate([
  param('id').isMongoId().withMessage('Invalid venue ID')
]), updateVenue);

router.delete('/:id', protect, authorize('venue_owner', 'admin'), validate([
  param('id').isMongoId().withMessage('Invalid venue ID')
]), deleteVenue);

router.get('/:id/availability', validate([
  param('id').isMongoId().withMessage('Invalid venue ID'),
  query('startDate').isISO8601().withMessage('Valid start date required'),
  query('endDate').isISO8601().withMessage('Valid end date required')
]), checkAvailability);

router.post('/:id/favorite', protect, validate([
  param('id').isMongoId().withMessage('Invalid venue ID')
]), toggleFavorite);

export default router;