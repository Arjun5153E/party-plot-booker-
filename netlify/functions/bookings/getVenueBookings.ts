import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Booking, Venue } from '../utils/Models';
import { protect, authorize } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, getQueryParams, getPathParams } from '../utils/response';
import { handleError } from '../utils/errors';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    authorize('venue_owner', 'admin')(event as any);
    const { venueId } = getPathParams(event);
    const venue = await Venue.findById(venueId);
    if (!venue) throw new NotFoundError('Venue');
    if (venue.owner.toString() !== (event as any).user._id.toString() && (event as any).user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to view these bookings');
    }
    const query = getQueryParams(event);
    const { page = 1, limit = 10, status } = query;
    const filter: any = { venue: venueId };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(filter),
    ]);
    return successResponse({
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      bookings,
    });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };