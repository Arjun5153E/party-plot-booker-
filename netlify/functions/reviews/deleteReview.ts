import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Review, Venue } from '../utils/Models';
import { protect } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, getPathParams } from '../utils/response';
import { handleError } from '../utils/errors';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    const { id } = getPathParams(event);
    const review = await Review.findById(id);
    if (!review) throw new NotFoundError('Review');
    if (review.user.toString() !== (event as any).user._id.toString() && (event as any).user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to delete this review');
    }
    const venueId = review.venue;
    await review.deleteOne();
    const venueReviews = await Review.find({ venue: venueId });
    const avgRating = venueReviews.length > 0
      ? venueReviews.reduce((sum, r) => sum + r.rating.overall, 0) / venueReviews.length
      : 0;
    await Venue.findByIdAndUpdate(venueId, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count': venueReviews.length,
    });
    return successResponse({ message: 'Review deleted successfully' });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };