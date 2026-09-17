import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Review, Venue } from '../utils/Models';
import { protect } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, parseBody, getPathParams } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    const { id } = getPathParams(event);
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'rating.overall', validate: validators.isInt({ min: 1, max: 5 }, 'Overall rating'), message: '' },
      { field: 'rating.cleanliness', validate: validators.isInt({ min: 1, max: 5 }, 'Cleanliness rating'), message: '' },
      { field: 'rating.service', validate: validators.isInt({ min: 1, max: 5 }, 'Service rating'), message: '' },
      { field: 'rating.value', validate: validators.isInt({ min: 1, max: 5 }, 'Value rating'), message: '' },
      { field: 'rating.location', validate: validators.isInt({ min: 1, max: 5 }, 'Location rating'), message: '' },
      { field: 'comment', validate: (v) => v && v.trim() === '' ? 'Comment cannot be empty' : null, message: '' },
      { field: 'images', validate: (v) => v && !Array.isArray(v) ? 'Images must be an array' : null, message: '' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const review = await Review.findById(id);
    if (!review) throw new NotFoundError('Review');
    if (review.user.toString() !== (event as any).user._id.toString()) {
      throw new ForbiddenError('Not authorized to update this review');
    }
    if (body.rating) review.rating = body.rating;
    if (body.comment) review.comment = body.comment;
    if (body.images) review.images = body.images;
    await review.save();
    await review.populate('user', 'name avatar');
    const venueReviews = await Review.find({ venue: review.venue });
    const avgRating = venueReviews.reduce((sum, r) => sum + r.rating.overall, 0) / venueReviews.length;
    await Venue.findByIdAndUpdate(review.venue, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count': venueReviews.length,
    });
    return successResponse({ review });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };