import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import mongoose from 'mongoose';
import { connectDB } from '../utils/db';
import { Review, Booking, Venue } from '../utils/Models';
import { protect } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, parseBody } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'venue', validate: validators.isMongoId('Venue ID'), message: 'Valid venue ID required' },
      { field: 'booking', validate: validators.isMongoId('Booking ID'), message: 'Valid booking ID required' },
      { field: 'rating.overall', validate: validators.isInt({ min: 1, max: 5 }, 'Overall rating'), message: 'Overall rating 1-5 required' },
      { field: 'rating.cleanliness', validate: validators.isInt({ min: 1, max: 5 }, 'Cleanliness rating'), message: '' },
      { field: 'rating.service', validate: validators.isInt({ min: 1, max: 5 }, 'Service rating'), message: '' },
      { field: 'rating.value', validate: validators.isInt({ min: 1, max: 5 }, 'Value rating'), message: '' },
      { field: 'rating.location', validate: validators.isInt({ min: 1, max: 5 }, 'Location rating'), message: '' },
      { field: 'comment', validate: validators.required('Comment'), message: 'Comment required' },
      { field: 'images', validate: (v) => v && !Array.isArray(v) ? 'Images must be an array' : null, message: '' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const booking = await Booking.findById(body.booking);
    if (!booking) throw new NotFoundError('Booking');
    if (booking.user.toString() !== (event as any).user._id.toString()) {
      throw new ForbiddenError('Not authorized to review this booking');
    }
    if (booking.status !== 'completed') {
      throw new ValidationError([{ field: 'booking', message: 'Can only review completed bookings' }]);
    }
    const existingReview = await Review.findOne({ user: (event as any).user._id, venue: body.venue });
    if (existingReview) {
      throw new ValidationError([{ field: 'venue', message: 'Already reviewed this venue' }]);
    }
    const review = await Review.create({
      user: (event as any).user._id,
      venue: body.venue,
      booking: body.booking,
      rating: body.rating,
      comment: body.comment,
      images: body.images || [],
      isVerified: true,
    });
    await review.populate('user', 'name avatar');
    const venueReviews = await Review.find({ venue: body.venue });
    const avgRating = venueReviews.reduce((sum, r) => sum + r.rating.overall, 0) / venueReviews.length;
    await Venue.findByIdAndUpdate(body.venue, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count': venueReviews.length,
    });
    return successResponse({ review }, 201);
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };