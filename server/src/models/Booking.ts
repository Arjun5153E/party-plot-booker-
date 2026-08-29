import mongoose, { Document, Schema, Model } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed' | 'partial';

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
    additionalCharges: { name: string; amount: number }[];
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    transactionId?: string;
    paymentMethod?: string;
    paidAt?: Date;
  };
  cancellation?: {
    cancelledAt: Date;
    cancelledBy: 'user' | 'owner' | 'admin';
    reason?: string;
    refundAmount: number;
  };
  communicationLog: {
    message: string;
    sentBy: 'user' | 'owner' | 'system';
    sentAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
  eventDetails: {
    eventName: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
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
    additionalCharges: [{
      name: { type: String },
      amount: { type: Number }
    }],
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded', 'failed', 'partial'], 
    default: 'pending' 
  },
  paymentDetails: {
    transactionId: { type: String },
    paymentMethod: { type: String },
    paidAt: { type: Date }
  },
  cancellation: {
    cancelledAt: { type: Date },
    cancelledBy: { type: String, enum: ['user', 'owner', 'admin'] },
    reason: { type: String },
    refundAmount: { type: Number, default: 0 }
  },
  communicationLog: [{
    message: { type: String, required: true },
    sentBy: { type: String, enum: ['user', 'owner', 'system'], required: true },
    sentAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ venue: 1, 'dates.startDate': 1 });
bookingSchema.index({ status: 1 });

export const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);