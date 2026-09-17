import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Venue } from '../utils/Models';
import { protect, authorize } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, getPathParams } from '../utils/response';
import { handleError } from '../utils/errors';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    authorize('venue_owner', 'admin')(event as any);
    const { id } = getPathParams(event);
    const venue = await Venue.findById(id);
    if (!venue) throw new NotFoundError('Venue');
    if (venue.owner.toString() !== (event as any).user._id.toString() && (event as any).user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to delete this venue');
    }
    await venue.deleteOne();
    return successResponse({ message: 'Venue deleted successfully' });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };