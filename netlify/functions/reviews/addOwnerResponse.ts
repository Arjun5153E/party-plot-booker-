import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Review, Venue } from '../utils/Models';
import { protect, authorize } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, parseBody, getPathParams } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    authorize('venue_owner', 'admin')(event as any);
    const { id } = getPathParams(event);
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'message', validate: validators.required('Message'), message: 'Response message required' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const review = await Review.findById(id).populate('venue');
    if (!review) throw new NotFoundError('Review');
    const venue = review.venue as any;
    if (venue.owner.toString() !== (event as any).user._id.toString()) {
      throw new ForbiddenError('Not authorized to respond to this review');
    }
    if (review.ownerResponse) {
      throw new ValidationError([{ field: 'ownerResponse', message: 'Owner already responded' }]);
    }
    review.ownerResponse = {
      message: body.message,
      respondedAt: new Date(),
    };
    await review.save();
    return successResponse({ review });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };