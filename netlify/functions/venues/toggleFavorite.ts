import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { User, Venue } from '../utils/Models';
import { protect } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, getPathParams } from '../utils/response';
import { handleError } from '../utils/errors';
import { NotFoundError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    const { id: venueId } = getPathParams(event);
    const venue = await Venue.findById(venueId);
    if (!venue) throw new NotFoundError('Venue');
    const user = await User.findById((event as any).user._id);
    if (!user) throw new NotFoundError('User');
    const venueIndex = user.favoriteVenues.indexOf(venueId as any);
    let isFavorite = false;
    if (venueIndex > -1) {
      user.favoriteVenues.splice(venueIndex, 1);
    } else {
      user.favoriteVenues.push(venueId as any);
      isFavorite = true;
    }
    await user.save();
    return successResponse({
      isFavorite,
      favorites: user.favoriteVenues,
    });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };