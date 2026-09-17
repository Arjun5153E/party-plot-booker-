import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Venue } from '../utils/Models';
import { protect, authorize } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, parseBody } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
import { ValidationError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    authorize('venue_owner', 'admin')(event as any);
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'name', validate: validators.required('Name'), message: 'Name is required' },
      { field: 'description', validate: validators.required('Description'), message: 'Description is required' },
      { field: 'capacity.min', validate: validators.isInt({ min: 1 }, 'Minimum capacity'), message: 'Minimum capacity required' },
      { field: 'capacity.max', validate: validators.isInt({ min: 1 }, 'Maximum capacity'), message: 'Maximum capacity required' },
      { field: 'pricing.basePrice', validate: validators.isFloat({ min: 0 }, 'Base price'), message: 'Base price required' },
      { field: 'pricing.priceType', validate: validators.isIn(['hourly', 'daily', 'event'], 'Price type'), message: '' },
      { field: 'location.address', validate: validators.required('Address'), message: 'Address required' },
      { field: 'location.city', validate: validators.required('City'), message: 'City required' },
      { field: 'location.state', validate: validators.required('State'), message: 'State required' },
      { field: 'location.zipCode', validate: validators.required('Zip code'), message: 'Zip code required' },
      { field: 'location.coordinates', validate: (v) => Array.isArray(v) && v.length === 2 ? null : 'Coordinates required [lng, lat]', message: '' },
      { field: 'amenities', validate: (v) => v && !Array.isArray(v) ? 'Amenities must be an array' : null, message: '' },
      { field: 'images', validate: (v) => v && !Array.isArray(v) ? 'Images must be an array' : null, message: '' },
      { field: 'rules', validate: (v) => v && !Array.isArray(v) ? 'Rules must be an array' : null, message: '' },
      { field: 'cancellationPolicy', validate: validators.isIn(['flexible', 'moderate', 'strict'], 'Cancellation policy'), message: '' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const venueData = {
      ...body,
      owner: (event as any).user._id,
    };
    const venue = await Venue.create(venueData);
    await venue.populate('owner', 'name avatar');
    return successResponse({ venue }, 201);
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };