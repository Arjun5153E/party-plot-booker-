import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { Venue } from '../utils/Models';
import { optionalAuth } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, getQueryParams } from '../utils/response';
import { handleError } from '../utils/errors';

interface VenueQuery {
  page?: number;
  limit?: number;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  amenities?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  lat?: number;
  lng?: number;
  radius?: number;
}

const buildVenueQuery = (query: VenueQuery) => {
  const filter: any = { isActive: true };

  if (query.city) filter['location.city'] = new RegExp(query.city, 'i');
  if (query.state) filter['location.state'] = new RegExp(query.state, 'i');

  if (query.minPrice || query.maxPrice) {
    filter['pricing.basePrice'] = {};
    if (query.minPrice) filter['pricing.basePrice'].$gte = query.minPrice;
    if (query.maxPrice) filter['pricing.basePrice'].$lte = query.maxPrice;
  }

  if (query.minCapacity || query.maxCapacity) {
    filter['capacity.max'] = {};
    if (query.minCapacity) filter['capacity.max'].$gte = query.minCapacity;
    if (query.maxCapacity) filter['capacity.max'].$lte = query.maxCapacity;
  }

  if (query.amenities) {
    const amenitiesArray = query.amenities.split(',').map(a => a.trim());
    filter.amenities = { $all: amenitiesArray };
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.lat && query.lng) {
    const radius = query.radius || 50000;
    filter['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [query.lng, query.lat],
        },
        $maxDistance: radius,
      },
    };
  }

  return filter;
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await optionalAuth(event as any);
    await connectDB();
    const query = getQueryParams(event) as unknown as VenueQuery;
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = query;
    const filter = buildVenueQuery(filters);
    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [venues, total] = await Promise.all([
      Venue.find(filter)
        .populate('owner', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Venue.countDocuments(filter),
    ]);
    return successResponse({
      count: venues.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      venues,
    });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };