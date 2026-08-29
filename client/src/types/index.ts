export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'venue_owner';
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  bookings: string[];
  favoriteVenues: string[];
  createdAt: string;
}

export interface Venue {
  _id: string;
  name: string;
  description: string;
  owner: User | string;
  images: string[];
  amenities: string[];
  capacity: {
    min: number;
    max: number;
  };
  pricing: {
    basePrice: number;
    currency: string;
    priceType: 'hourly' | 'daily' | 'event';
    additionalCharges?: { name: string; amount: number }[];
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
    nearbyLandmarks?: string[];
  };
  availability: {
    isAvailable: boolean;
    blockedDates: string[];
    recurringSchedule?: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[];
  };
  rules: string[];
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  rating: {
    average: number;
    count: number;
  };
  reviews: Review[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface Booking {
  _id: string;
  user: User | string;
  venue: Venue | string;
  eventDetails: {
    eventName: string;
    eventType: string;
    expectedGuests: number;
    specialRequests?: string;
  };
  dates: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  pricing: {
    basePrice: number;
    additionalCharges: { name: string; amount: number }[];
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed' | 'partial';
  paymentDetails?: {
    transactionId?: string;
    paymentMethod?: string;
    paidAt?: string;
  };
  cancellation?: {
    cancelledAt: string;
    cancelledBy: 'user' | 'owner' | 'admin';
    reason?: string;
    refundAmount: number;
  };
  communicationLog: {
    message: string;
    sentBy: 'user' | 'owner' | 'system';
    sentAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: User | string;
  venue: string;
  booking: string;
  rating: {
    overall: number;
    cleanliness: number;
    service: number;
    value: number;
    location: number;
  };
  comment: string;
  images: string[];
  isVerified: boolean;
  ownerResponse?: {
    message: string;
    respondedAt: string;
  };
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  venues?: T[];
  bookings?: T[];
  reviews?: T[];
  data?: T[];
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface VenueFilters {
  page?: number;
  limit?: number;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  amenities?: string[];
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface BookingFormData {
  venue: string;
  eventDetails: {
    eventName: string;
    eventType: string;
    expectedGuests: number;
    specialRequests?: string;
  };
  dates: {
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
  };
  pricing: {
    basePrice: number;
    total: number;
  };
}

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}