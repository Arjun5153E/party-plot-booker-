import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Venue } from '../utils/Models';
import { successResponse, errorResponse, handleOptions, getQueryParams } from '../utils/response';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await connectDB();
    const query = getQueryParams(event);
    const { lat, lng, radius = 50000, limit = 10 } = query;
    if (!lat || !lng) {
      return errorResponse('Latitude and longitude required', 400);
    }
    const venues = await Venue.find({
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
          },
          $maxDistance: parseInt(radius as string),
        },
      },
    })
      .limit(parseInt(limit as string))
      .populate('owner', 'name avatar')
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