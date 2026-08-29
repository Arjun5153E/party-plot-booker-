import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  venue: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
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

export const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);