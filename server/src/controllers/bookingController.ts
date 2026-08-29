import { Request, Response } from 'express';
import { Booking, IBooking, BookingStatus, Venue } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, NotFoundError, ForbiddenError, ValidationError } from '../middleware/errorHandler.js';
import { io } from '../index.js';

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const {
    venue: venueId,
    eventDetails,
    dates,
    pricing
  } = req.body;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw new NotFoundError('Venue');
  }

  if (!venue.availability.isAvailable) {
    throw new ValidationError([{ field: 'venue', message: 'Venue is not available for booking' }]);
  }

  const startDate = new Date(dates.startDate);
  const endDate = new Date(dates.endDate);

  const isBlocked = venue.availability.blockedDates.some(
    (date: Date) => date >= startDate && date <= endDate
  );

  if (isBlocked) {
    throw new ValidationError([{ field: 'dates', message: 'Selected dates are blocked' }]);
  }

  const existingBookings = await Booking.find({
    venue: venueId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { 'dates.startDate': { $lte: endDate }, 'dates.endDate': { $gte: startDate } }
    ]
  });

  if (existingBookings.length > 0) {
    throw new ValidationError([{ field: 'dates', message: 'Venue is already booked for selected dates' }]);
  }

  if (eventDetails.expectedGuests > venue.capacity.max) {
    throw new ValidationError([{ field: 'eventDetails.expectedGuests', message: `Exceeds venue capacity of ${venue.capacity.max}` }]);
  }

  const booking = await Booking.create({
    user: req.user._id,
    venue: venueId,
    eventDetails,
    dates: {
      startDate,
      endDate,
      startTime: dates.startTime,
      endTime: dates.endTime
    },
    pricing,
    status: 'pending',
    paymentStatus: 'pending'
  });

  await booking.populate('venue', 'name location images pricing');
  await booking.populate('user', 'name email phone');

  io?.to(`venue-${venueId}`).emit('new-booking', booking);
  io?.to(`user-${req.user._id}`).emit('booking-created', booking);

  res.status(201).json({
    success: true,
    booking
  });
});

export const getBookings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { page = 1, limit = 10, status } = req.query;
  const filter: any = { user: req.user._id };

  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('venue', 'name location images pricing owner')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Booking.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    bookings
  });
});

export const getBooking = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const booking = await Booking.findById(req.params.id)
    .populate('venue', 'name location images pricing owner rules cancellationPolicy')
    .populate('user', 'name email phone avatar');

  if (!booking) {
    throw new NotFoundError('Booking');
  }

  // Cast populated fields to any to prevent TypeScript "Property does not exist on type ObjectId" errors
  const populatedUser = booking.user as any;
  const populatedVenue = booking.venue as any;

  if (populatedUser._id.toString() !== req.user._id.toString() && 
      populatedVenue.owner.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to view this booking');
  }

  res.status(200).json({
    success: true,
    booking
  });
});

export const updateBookingStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { status } = req.body;
  const validStatuses: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'];

  if (!validStatuses.includes(status)) {
    throw new ValidationError([{ field: 'status', message: 'Invalid status' }]);
  }

  const booking = await Booking.findById(req.params.id).populate('venue');
  if (!booking) {
    throw new NotFoundError('Booking');
  }

  const venue = booking.venue as any;
  if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to update this booking');
  }

  if (booking.status === 'cancelled' && status !== 'cancelled') {
    throw new ValidationError([{ field: 'status', message: 'Cannot update cancelled booking' }]);
  }

  booking.status = status;
  if (status === 'confirmed') {
    booking.paymentStatus = 'paid';
    booking.paymentDetails = {
      ...booking.paymentDetails,
      paidAt: new Date()
    };
  }
  await booking.save();

  await booking.populate('venue', 'name location images pricing');
  await booking.populate('user', 'name email phone');

  io?.to(`user-${booking.user}`).emit('booking-updated', booking);
  io?.to(`venue-${venue._id}`).emit('booking-updated', booking);

  res.status(200).json({
    success: true,
    booking
  });
});

export const cancelBooking = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id).populate('venue');
  if (!booking) {
    throw new NotFoundError('Booking');
  }

  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
    cancelledBy: req.user.role === 'admin' ? 'admin' : 'user',
    reason,
    refundAmount
  };
  booking.paymentStatus = refundAmount > 0 ? 'refunded' : 'failed';
  await booking.save();

  await booking.populate('venue', 'name location images pricing');
  await booking.populate('user', 'name email phone');

  io?.to(`user-${booking.user}`).emit('booking-cancelled', booking);
  io?.to(`venue-${venue._id}`).emit('booking-cancelled', booking);

  res.status(200).json({
    success: true,
    booking,
    refundAmount
  });
});

export const getVenueBookings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { venueId } = req.params;
  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw new NotFoundError('Venue');
  }

  if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to view these bookings');
  }

  const { page = 1, limit = 10, status } = req.query;
  const filter: any = { venue: venueId };

  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Booking.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    bookings
  });
});

export const addCommunication = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { message } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError('Booking');
  }

  const venue = await Venue.findById(booking.venue);
  if (!venue) {
    throw new NotFoundError('Venue');
  }

  const isOwner = venue.owner.toString() === req.user._id.toString();
  // Casting to safely extract the string from a potential ObjectId
  const isUser = booking.user.toString() === req.user._id.toString();

  if (!isOwner && !isUser && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized');
  }

  booking.communicationLog.push({
    message,
    sentBy: isOwner ? 'owner' : 'user',
    sentAt: new Date()
  });

  await booking.save();

  io?.to(`user-${booking.user}`).emit('new-message', { bookingId: booking._id, message, sentBy: isOwner ? 'owner' : 'user' });
  io?.to(`venue-${venue._id}`).emit('new-message', { bookingId: booking._id, message, sentBy: isOwner ? 'owner' : 'user' });

  res.status(200).json({
    success: true,
    communicationLog: booking.communicationLog
  });
});