import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin' | 'venue_owner';
  avatar?: string;
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
  bookings: mongoose.Types.ObjectId[];
  favoriteVenues: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin', 'venue_owner'], default: 'user' },
  avatar: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] }
    }
  },
  bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  favoriteVenues: [{ type: Schema.Types.ObjectId, ref: 'Venue' }]
}, { timestamps: true });

userSchema.index({ 'address.coordinates': '2dsphere' });

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.compare(candidatePassword, this.password);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const bcrypt = await import('bcryptjs');
  this.password = await bcrypt.default.hash(this.password, 12);
  next();
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export interface IVenue extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
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
    additionalCharges?: {
      name: string;
      amount: number;
    }[];
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
    blockedDates: Date[];
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
  reviews: mongoose.Types.ObjectId[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }],
  amenities: [{ type: String, trim: true }],
  capacity: {
    min: { type: Number, required: true, min: 1 },
    max: { type: Number, required: true, min: 1 }
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    priceType: { type: String, enum: ['hourly', 'daily', 'event'], default: 'daily' },
    additionalCharges: [{
      name: { type: String },
      amount: { type: Number }
    }]
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    nearbyLandmarks: [{ type: String }]
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    blockedDates: [{ type: Date }],
    recurringSchedule: [{
      dayOfWeek: { type: Number, min: 0, max: 6 },
      startTime: { type: String },
      endTime: { type: String },
      isAvailable: { type: Boolean, default: true }
    }]
  },
  rules: [{ type: String }],
  cancellationPolicy: { type: String, enum: ['flexible', 'moderate', 'strict'], default: 'moderate' },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

venueSchema.index({ 'location.coordinates': '2dsphere' });
venueSchema.index({ 'location.city': 1, 'location.state': 1 });
venueSchema.index({ name: 'text', description: 'text' });

export const Venue: Model<IVenue> = mongoose.models.Venue || mongoose.model<IVenue>('Venue', venueSchema);

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  venue: mongoose.Types.ObjectId;
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
    currency: string;
    breakdown?: { name: string; amount: number }[];
  };
  status: BookingStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentDetails?: {
    transactionId?: string;
    paidAt?: Date;
    refundedAt?: Date;
  };
  cancellation?: {
    cancelledAt: Date;
    cancelledBy: 'user' | 'owner' | 'admin';
    reason?: string;
    refundAmount: number;
  };
  communicationLog: {
    message: string;
    sentBy: 'user' | 'owner';
    sentAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
  eventDetails: {
    eventName: { type: String, required: true },
    eventType: { type: String, required: true },
    expectedGuests: { type: Number, required: true, min: 1 },
    specialRequests: { type: String }
  },
  dates: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    breakdown: [{
      name: { type: String },
      amount: { type: Number }
    }]
  },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
  paymentDetails: {
    transactionId: { type: String },
    paidAt: { type: Date },
    refundedAt: { type: Date }
  },
  cancellation: {
    cancelledAt: { type: Date },
    cancelledBy: { type: String, enum: ['user', 'owner', 'admin'] },
    reason: { type: String },
    refundAmount: { type: Number, default: 0 }
  },
  communicationLog: [{
    message: { type: String, required: true },
    sentBy: { type: String, enum: ['user', 'owner'], required: true },
    sentAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ venue: 1, status: 1 });
bookingSchema.index({ 'dates.startDate': 1, 'dates.endDate': 1 });

export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  venue: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  rating: {
    overall: number;
    cleanliness?: number;
    service?: number;
    value?: number;
    location?: number;
  };
  comment: string;
  images: string[];
  isVerified: boolean;
  ownerResponse?: {
    message: string;
    respondedAt: Date;
  };
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 }
  },
  comment: { type: String, required: true, trim: true },
  images: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  ownerResponse: {
    message: { type: String },
    respondedAt: { type: Date }
  },
  helpfulCount: { type: Number, default: 0 }
}, { timestamps: true });

reviewSchema.index({ venue: 1, createdAt: -1 });
reviewSchema.index({ user: 1, venue: 1 }, { unique: true });
reviewSchema.index({ booking: 1 }, { unique: true });

export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);