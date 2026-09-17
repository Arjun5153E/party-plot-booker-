import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Venue } from '../utils/Models';
import { protect, authorize } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, parseBody, getPathParams } from '../utils/response';
import { handleError } from '../utils/errors';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    authorize('venue_owner', 'admin')(event as any);
    const { id } = getPathParams(event);
    const body = parseBody(event);
    const venue = await Venue.findById(id);
    if (!venue) throw new NotFoundError('Venue');
    if (venue.owner.toString() !== (event as any).user._id.toString() && (event as any).user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to update this venue');
    }
    const updatedVenue = await Venue.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name avatar');
    return successResponse({ venue: updatedVenue });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };