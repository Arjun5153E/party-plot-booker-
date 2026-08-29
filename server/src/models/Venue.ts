import mongoose, { Document, Schema, Model } from 'mongoose';

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

export const Venue: Model<IVenue> = mongoose.model<IVenue>('Venue', venueSchema);