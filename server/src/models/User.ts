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

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);