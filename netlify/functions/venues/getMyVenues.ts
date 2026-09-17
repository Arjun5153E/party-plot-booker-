import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Venue } from '../utils/Models';
import { protect, authorize } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions } from '../utils/response';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    authorize('venue_owner', 'admin')(event as any);
    const venues = await Venue.find({ owner: (event as any).user._id })
      .sort({ createdAt: -1 })
      .lean();
    return successResponse({
      count: venues.length,
      venues,
    });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };