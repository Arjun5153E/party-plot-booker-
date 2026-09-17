import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import mongoose from 'mongoose';
import { connectDB } from '../utils/db';
import { Review } from '../utils/Models';
import { successResponse, errorResponse, handleOptions, getQueryParams, getPathParams } from '../utils/response';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await connectDB();
    const { venueId } = getPathParams(event);
    const query = getQueryParams(event);
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };
    const [reviews, total] = await Promise.all([
      Review.find({ venue: venueId })
        .populate('user', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments({ venue: venueId }),
    ]);
    const ratingDistribution = await Review.aggregate([
      { $match: { venue: new mongoose.Types.ObjectId(venueId) } },
      { $group: { _id: '$rating.overall', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);
    return successResponse({
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      reviews,
      ratingDistribution,
    });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };