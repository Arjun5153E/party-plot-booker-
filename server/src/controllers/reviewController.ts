import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Review, IReview, Booking, Venue } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, NotFoundError, ForbiddenError, ValidationError } from '../middleware/errorHandler.js';

export const createReview = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { venue: venueId, booking: bookingId, rating, comment, images } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new NotFoundError('Booking');
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('Not authorized to review this booking');
  }

  if (booking.status !== 'completed') {
    throw new ValidationError([{ field: 'booking', message: 'Can only review completed bookings' }]);
  }

  const existingReview = await Review.findOne({ user: req.user._id, venue: venueId });
  if (existingReview) {
    throw new ValidationError([{ field: 'venue', message: 'Already reviewed this venue' }]);
  }

  const review = await Review.create({
    user: req.user._id,
    venue: venueId,
    booking: bookingId,
    rating,
    comment,
    images: images || [],
    isVerified: true
  });

  await review.populate('user', 'name avatar');

  const venueReviews = await Review.find({ venue: venueId });
  const avgRating = venueReviews.reduce((sum, r) => sum + r.rating.overall, 0) / venueReviews.length;

  await Venue.findByIdAndUpdate(venueId, {
    'rating.average': Math.round(avgRating * 10) / 10,
    'rating.count': venueReviews.length
  });

  res.status(201).json({
    success: true,
    review
  });
});

export const getVenueReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { venueId } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

  const [reviews, total] = await Promise.all([
    Review.find({ venue: venueId })
      .populate('user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Review.countDocuments({ venue: venueId })
  ]);

  const ratingDistribution = await Review.aggregate([
    { $match: { venue: new mongoose.Types.ObjectId(venueId) } },
    { $group: { _id: '$rating.overall', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    reviews,
    ratingDistribution
  });
});

export const updateReview = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new NotFoundError('Review');
  }

  if (review.user.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('Not authorized to update this review');
  }

  const { rating, comment, images } = req.body;
  if (rating) review.rating = rating;
  if (comment) review.comment = comment;
  if (images) review.images = images;

  await review.save();
  await review.populate('user', 'name avatar');

  const venueReviews = await Review.find({ venue: review.venue });
  const avgRating = venueReviews.reduce((sum, r) => sum + r.rating.overall, 0) / venueReviews.length;

  await Venue.findByIdAndUpdate(review.venue, {
    'rating.average': Math.round(avgRating * 10) / 10,
    'rating.count': venueReviews.length
  });

  res.status(200).json({
    success: true,
    review
  });
});

export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new NotFoundError('Review');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to delete this review');
  }

  const venueId = review.venue;
  await review.deleteOne();

  const venueReviews = await Review.find({ venue: venueId });
  const avgRating = venueReviews.length > 0 
    ? venueReviews.reduce((sum, r) => sum + r.rating.overall, 0) / venueReviews.length 
    : 0;

  await Venue.findByIdAndUpdate(venueId, {
    'rating.average': Math.round(avgRating * 10) / 10,
    'rating.count': venueReviews.length
  });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

export const addOwnerResponse = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { message } = req.body;
  const review = await Review.findById(req.params.id).populate('venue');
  if (!review) {
    throw new NotFoundError('Review');
  }

  const venue = review.venue as any;
  if (venue.owner.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('Not authorized to respond to this review');
  }

  if (review.ownerResponse) {
    throw new ValidationError([{ field: 'ownerResponse', message: 'Owner already responded' }]);
  }

  review.ownerResponse = {
    message,
    respondedAt: new Date()
  };

  await review.save();

  res.status(200).json({
    success: true,
    review
  });
});

export const markHelpful = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new NotFoundError('Review');
  }

  review.helpfulCount += 1;
  await review.save();

  res.status(200).json({
    success: true,
    helpfulCount: review.helpfulCount
  });
});