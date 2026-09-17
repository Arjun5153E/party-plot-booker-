import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Booking } from '../utils/Models';
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
    const booking = await Booking.findById(id)
      .populate('venue', 'name location images pricing owner rules cancellationPolicy')
      .populate('user', 'name email phone avatar');
    if (!booking) throw new NotFoundError('Booking');
    const populatedUser = booking.user as any;
    const populatedVenue = booking.venue as any;
    if (populatedUser._id.toString() !== (event as any).user._id.toString() &&
        populatedVenue.owner.toString() !== (event as any).user._id.toString() &&
        (event as any).user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to view this booking');
    }
    return successResponse({ booking });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };