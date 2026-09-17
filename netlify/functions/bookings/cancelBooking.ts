import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Booking, Venue } from '../utils/Models';
import { protect } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, parseBody, getPathParams } from '../utils/response';
import { validateBody } from '../utils/validation';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    const { id } = getPathParams(event);
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'reason', validate: () => null, message: '' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const booking = await Booking.findById(id).populate('venue');
    if (!booking) throw new NotFoundError('Booking');
    if (booking.user.toString() !== (event as any).user._id.toString() && (event as any).user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to cancel this booking');
    }
    if (booking.status === 'cancelled') {
      throw new ValidationError([{ field: 'status', message: 'Booking already cancelled' }]);
    }
    if (booking.status === 'completed') {
      throw new ValidationError([{ field: 'status', message: 'Cannot cancel completed booking' }]);
    }
    const venue = booking.venue as any;
    const cancellationPolicy = venue.cancellationPolicy || 'moderate';
    let refundAmount = 0;
    const daysUntilEvent = Math.ceil((new Date(booking.dates.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    switch (cancellationPolicy) {
      case 'flexible':
        refundAmount = daysUntilEvent >= 1 ? booking.pricing.total : booking.pricing.total * 0.5;
        break;
      case 'moderate':
        refundAmount = daysUntilEvent >= 5 ? booking.pricing.total : daysUntilEvent >= 1 ? booking.pricing.total * 0.5 : 0;
        break;
      case 'strict':
        refundAmount = daysUntilEvent >= 7 ? booking.pricing.total * 0.5 : 0;
        break;
    }
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: (event as any).user.role === 'admin' ? 'admin' : 'user',
      reason: body.reason,
      refundAmount,
    };
    booking.paymentStatus = refundAmount > 0 ? 'refunded' : 'failed';
    await booking.save();
    await booking.populate('venue', 'name location images pricing');
    await booking.populate('user', 'name email phone');
    return successResponse({ booking, refundAmount });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };