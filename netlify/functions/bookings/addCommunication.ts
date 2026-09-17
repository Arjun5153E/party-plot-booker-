import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Booking, Venue } from '../utils/Models';
import { protect } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, parseBody, getPathParams } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
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
      { field: 'message', validate: validators.required('Message'), message: 'Message required' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const booking = await Booking.findById(id);
    if (!booking) throw new NotFoundError('Booking');
    const venue = await Venue.findById(booking.venue);
    if (!venue) throw new NotFoundError('Venue');
    const isOwner = venue.owner.toString() === (event as any).user._id.toString();
    const isUser = booking.user.toString() === (event as any).user._id.toString();
    if (!isOwner && !isUser && (event as any).user.role !== 'admin') {
      throw new ForbiddenError('Not authorized');
    }
    booking.communicationLog.push({
      message: body.message,
      sentBy: isOwner ? 'owner' : 'user',
      sentAt: new Date(),
    });
    await booking.save();
    return successResponse({
      communicationLog: booking.communicationLog,
    });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };