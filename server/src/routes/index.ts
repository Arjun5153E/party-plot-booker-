import authRoutes from './authRoutes';
import venueRoutes from './venueRoutes';
import bookingRoutes from './bookingRoutes';
import reviewRoutes from './reviewRoutes';

export const routes = {
  auth: authRoutes,
  venues: venueRoutes,
  bookings: bookingRoutes,
  reviews: reviewRoutes
};