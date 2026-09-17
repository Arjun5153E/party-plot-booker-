import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Review } from '../utils/Models';
import { protect } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, getPathParams } from '../utils/response';
import { handleError } from '../utils/errors';
import { NotFoundError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    const { id } = getPathParams(event);
    const review = await Review.findById(id);
    if (!review) throw new NotFoundError('Review');
    review.helpfulCount += 1;
    await review.save();
    return successResponse({ helpfulCount: review.helpfulCount });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };