import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getVenueBookings,
  addCommunication
} from '../controllers/bookingController';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

router.use(protect);

router.get('/', validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'rejected'])
]), getBookings);

router.post('/', validate([
  body('venue').isMongoId().withMessage('Valid venue ID required'),
  body('eventDetails.eventName').trim().notEmpty().withMessage('Event name required'),
  body('eventDetails.eventType').trim().notEmpty().withMessage('Event type required'),
  body('eventDetails.expectedGuests').isInt({ min: 1 }).withMessage('Expected guests required'),
  body('dates.startDate').isISO8601().withMessage('Valid start date required'),
  body('dates.endDate').isISO8601().withMessage('Valid end date required'),
  body('dates.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:MM)'),
  body('dates.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:MM)'),
  body('pricing.basePrice').isFloat({ min: 0 }).withMessage('Base price required'),
  body('pricing.total').isFloat({ min: 0 }).withMessage('Total price required')
]), createBooking);

router.get('/:id', validate([
  param('id').isMongoId().withMessage('Invalid booking ID')
]), getBooking);

router.put('/:id/status', authorize('venue_owner', 'admin'), validate([
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed', 'rejected']).withMessage('Invalid status')
]), updateBookingStatus);

router.delete('/:id', validate([
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('reason').optional().isString()
]), cancelBooking);

router.post('/:id/communicate', validate([
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('message').trim().notEmpty().withMessage('Message required')
]), addCommunication);

router.get('/venue/:venueId', authorize('venue_owner', 'admin'), validate([
  param('venueId').isMongoId().withMessage('Invalid venue ID'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'rejected'])
]), getVenueBookings);

export default router;