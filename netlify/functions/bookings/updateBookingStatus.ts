import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Booking } from '../utils/Models';
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
      { field: 'status', validate: validators.isIn(['pending', 'confirmed', 'cancelled', 'completed', 'rejected'], 'Status'), message: 'Invalid status' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const booking = await Booking.findById(id).populate('venue');
    if (!booking) throw new NotFoundError('Booking');
    const venue = booking.venue as any;
    if (venue.owner.toString() !== (event as any).user._id.toString() && (event as any).user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to update this booking');
    }
    if (booking.status === 'cancelled' && body.status !== 'cancelled') {
      throw new ValidationError([{ field: 'status', message: 'Cannot update cancelled booking' }]);
    }
    booking.status = body.status;
    if (body.status === 'confirmed') {
      booking.paymentStatus = 'paid';
      booking.paymentDetails = {
        ...booking.paymentDetails,
        paidAt: new Date(),
      };
    }
    await booking.save();
    await booking.populate('venue', 'name location images pricing');
    await booking.populate('user', 'name email phone');
    return successResponse({ booking });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };