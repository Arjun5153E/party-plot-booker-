import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Booking, Venue } from '../utils/Models';
import { protect } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, parseBody } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'venue', validate: validators.isMongoId('Venue ID'), message: 'Valid venue ID required' },
      { field: 'eventDetails.eventName', validate: validators.required('Event name'), message: 'Event name required' },
      { field: 'eventDetails.eventType', validate: validators.required('Event type'), message: 'Event type required' },
      { field: 'eventDetails.expectedGuests', validate: validators.isInt({ min: 1 }, 'Expected guests'), message: 'Expected guests required' },
      { field: 'dates.startDate', validate: validators.isISO8601('Start date'), message: 'Valid start date required' },
      { field: 'dates.endDate', validate: validators.isISO8601('End date'), message: 'Valid end date required' },
      { field: 'dates.startTime', validate: validators.matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time'), message: 'Valid start time required (HH:MM)' },
      { field: 'dates.endTime', validate: validators.matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time'), message: 'Valid end time required (HH:MM)' },
      { field: 'pricing.basePrice', validate: validators.isFloat({ min: 0 }, 'Base price'), message: 'Base price required' },
      { field: 'pricing.total', validate: validators.isFloat({ min: 0 }, 'Total price'), message: 'Total price required' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const venue = await Venue.findById(body.venue);
    if (!venue) throw new NotFoundError('Venue');
    if (!venue.availability.isAvailable) {
      throw new ValidationError([{ field: 'venue', message: 'Venue is not available for booking' }]);
    }
    const startDate = new Date(body.dates.startDate);
    const endDate = new Date(body.dates.endDate);
    const isBlocked = venue.availability.blockedDates.some(
      (date: Date) => date >= startDate && date <= endDate
    );
    if (isBlocked) {
      throw new ValidationError([{ field: 'dates', message: 'Selected dates are blocked' }]);
    }
    const existingBookings = await Booking.find({
      venue: body.venue,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { 'dates.startDate': { $lte: endDate }, 'dates.endDate': { $gte: startDate } },
      ],
    });
    if (existingBookings.length > 0) {
      throw new ValidationError([{ field: 'dates', message: 'Venue is already booked for selected dates' }]);
    }
    if (body.eventDetails.expectedGuests > venue.capacity.max) {
      throw new ValidationError([{ field: 'eventDetails.expectedGuests', message: `Exceeds venue capacity of ${venue.capacity.max}` }]);
    }
    const booking = await Booking.create({
      user: (event as any).user._id,
      venue: body.venue,
      eventDetails: body.eventDetails,
      dates: {
        startDate,
        endDate,
        startTime: body.dates.startTime,
        endTime: body.dates.endTime,
      },
      pricing: body.pricing,
      status: 'pending',
      paymentStatus: 'pending',
    });
    await booking.populate('venue', 'name location images pricing');
    await booking.populate('user', 'name email phone');
    return successResponse({ booking }, 201);
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };