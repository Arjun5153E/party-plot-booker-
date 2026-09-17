import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Venue, Booking } from '../utils/Models';
import { successResponse, errorResponse, handleOptions, getPathParams, getQueryParams } from '../utils/response';
import { handleError } from '../utils/errors';
import { NotFoundError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await connectDB();
    const { id: venueId } = getPathParams(event);
    const query = getQueryParams(event);
    const { startDate, endDate } = query;
    const venue = await Venue.findById(venueId);
    if (!venue) throw new NotFoundError('Venue');
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const isBlocked = venue.availability.blockedDates.some(
      (date: Date) => date >= start && date <= end
    );
    const existingBookings = await Booking.find({
      venue: venueId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { 'dates.startDate': { $lte: end }, 'dates.endDate': { $gte: start } },
      ],
    });
    const bookedDates: Date[] = [];
    existingBookings.forEach((booking: any) => {
      const bookingStart = new Date(booking.dates.startDate);
      const bookingEnd = new Date(booking.dates.endDate);
      for (let d = new Date(bookingStart); d <= bookingEnd; d.setDate(d.getDate() + 1)) {
        bookedDates.push(new Date(d));
      }
    });
    return successResponse({
      isAvailable: !isBlocked && existingBookings.length === 0,
      blockedDates: venue.availability.blockedDates,
      bookedDates,
      recurringSchedule: venue.availability.recurringSchedule,
    });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };