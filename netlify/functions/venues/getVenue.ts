import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Venue } from '../utils/Models';
import { optionalAuth } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, getPathParams } from '../utils/response';
import { handleError } from '../utils/errors';
import { NotFoundError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await optionalAuth(event as any);
    await connectDB();
    const { id } = getPathParams(event);
    const venue = await Venue.findById(id)
      .populate('owner', 'name avatar email phone')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' },
      });
    if (!venue) throw new NotFoundError('Venue');
    return successResponse({ venue });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };