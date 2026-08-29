import { Request, Response } from 'express';
import { Venue, IVenue, User, Booking } from '../models';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, NotFoundError, ForbiddenError } from '../middleware/errorHandler';

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
  startDate?: string;
  endDate?: string;
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
          coordinates: [query.lng, query.lat]
        },
        $maxDistance: radius
      }
    };
  }

  return filter;
};

export const getVenues = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 12,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    ...filters
  } = req.query as unknown as VenueQuery;

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
    Venue.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: venues.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    venues
  });
});

export const getVenue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const venue = await Venue.findById(req.params.id)
    .populate('owner', 'name avatar email phone')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name avatar' }
    });

  if (!venue) {
    throw new NotFoundError('Venue');
  }

  res.status(200).json({
    success: true,
    venue
  });
});

export const createVenue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const venueData = {
    ...req.body,
    owner: req.user._id
  };

  const venue = await Venue.create(venueData);

  await venue.populate('owner', 'name avatar');

  res.status(201).json({
    success: true,
    venue
  });
});

export const updateVenue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const venue: any = await Venue.findById(req.params.id);
  if (!venue) {
    throw new NotFoundError('Venue');
  }

  if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to update this venue');
  }

  const updatedVenue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('owner', 'name avatar');

  res.status(200).json({
    success: true,
    venue: updatedVenue
  });
});

export const deleteVenue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const venue: any = await Venue.findById(req.params.id);
  if (!venue) {
    throw new NotFoundError('Venue');
  }

  if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to delete this venue');
  }

  await venue.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Venue deleted successfully'
  });
});

export const getMyVenues = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const venues = await Venue.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: venues.length,
    venues
  });
});

export const checkAvailability = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { venueId } = req.params;
  const { startDate, endDate } = req.query;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw new NotFoundError('Venue');
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  const isBlocked = venue.availability.blockedDates.some(
    (date: Date) => date >= start && date <= end
  );

  const existingBookings: any[] = await Booking.find({
    venue: venueId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { 'dates.startDate': { $lte: end }, 'dates.endDate': { $gte: start } }
    ]
  });

  const bookedDates: Date[] = [];
  existingBookings.forEach((booking: any) => {
    const bookingStart = new Date(booking.dates.startDate);
    const bookingEnd = new Date(booking.dates.endDate);
    for (let d = new Date(bookingStart); d <= bookingEnd; d.setDate(d.getDate() + 1)) {
      bookedDates.push(new Date(d));
    }
  });

  res.status(200).json({
    success: true,
    isAvailable: !isBlocked && existingBookings.length === 0,
    blockedDates: venue.availability.blockedDates,
    bookedDates,
    recurringSchedule: venue.availability.recurringSchedule
  });
});

export const getNearbyVenues = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius = 50000, limit = 10 } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    return;
  }

  const venues = await Venue.find({
    isActive: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
        },
        $maxDistance: parseInt(radius as string)
      }
    }
  })
    .limit(parseInt(limit as string))
    .populate('owner', 'name avatar')
    .lean();

  res.status(200).json({
    success: true,
    count: venues.length,
    venues
  });
});

export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { venueId } = req.params;
  const user: any = await User.findById(req.user._id);

  if (!user) {
    throw new NotFoundError('User');
  }

  const venueIndex = user.favoriteVenues.indexOf(venueId as any);
  let isFavorite = false;

  if (venueIndex > -1) {
    user.favoriteVenues.splice(venueIndex, 1);
  } else {
    user.favoriteVenues.push(venueId as any);
    isFavorite = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    isFavorite,
    favorites: user.favoriteVenues
  });
});