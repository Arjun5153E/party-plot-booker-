import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Venue, Booking, Review } from '../models';
import bcrypt from 'bcryptjs';

const sampleVenues = [
  {
    name: 'Grand Celebration Hall',
    description: 'Elegant ballroom with crystal chandeliers, perfect for weddings and corporate events. Features a built-in stage, professional sound system, and customizable lighting.',
    owner: null,
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
    ],
    amenities: ['Parking', 'WiFi', 'Sound System', 'Stage', 'Lighting', 'Catering Kitchen', 'Restrooms', 'Wheelchair Accessible', 'Climate Control'],
    capacity: { min: 50, max: 300 },
    pricing: { basePrice: 2500, currency: 'USD', priceType: 'daily' },
    location: {
      address: '123 Celebration Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      coordinates: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      nearbyLandmarks: ['Downtown LA', 'Convention Center', 'Crypto.com Arena']
    },
    availability: { isAvailable: true, blockedDates: [] },
    rules: ['No smoking', 'No outside alcohol', 'Music until 11 PM', 'Decorations must be approved'],
    cancellationPolicy: 'moderate',
    isActive: true,
    isVerified: true
  },
  {
    name: 'Riverside Garden Pavilion',
    description: 'Beautiful outdoor pavilion overlooking the river, ideal for summer parties, receptions, and ceremonies. Includes a covered area and garden landscaping.',
    owner: null,
    images: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800'
    ],
    amenities: ['Parking', 'Restrooms', 'Garden', 'River View', 'Covered Area', 'Outdoor Lighting', 'Dance Floor'],
    capacity: { min: 30, max: 150 },
    pricing: { basePrice: 1800, currency: 'USD', priceType: 'daily' },
    location: {
      address: '456 Riverfront Dr',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA',
      coordinates: { type: 'Point', coordinates: [-97.7431, 30.2672] },
      nearbyLandmarks: ['Zilker Park', 'Lady Bird Lake', 'Downtown Austin']
    },
    availability: { isAvailable: true, blockedDates: [] },
    rules: ['No open flames', 'Clean up required', 'Noise curfew 10 PM', 'Pets allowed in designated areas'],
    cancellationPolicy: 'flexible',
    isActive: true,
    isVerified: true
  },
  {
    name: 'Urban Loft Events',
    description: 'Modern industrial loft space with exposed brick walls, high ceilings, and city views. Perfect for trendy parties, product launches, and art exhibitions.',
    owner: null,
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
    ],
    amenities: ['WiFi', 'Sound System', 'Projector', 'Kitchen', 'Restrooms', 'City Views', 'Rooftop Access', 'Parking'],
    capacity: { min: 20, max: 100 },
    pricing: { basePrice: 3200, currency: 'USD', priceType: 'daily' },
    location: {
      address: '789 Loft Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      coordinates: { type: 'Point', coordinates: [-74.0060, 40.7128] },
      nearbyLandmarks: ['Times Square', 'Empire State Building', 'Bryant Park']
    },
    availability: { isAvailable: true, blockedDates: [] },
    rules: ['No nails in walls', 'Catering from approved vendors', 'Event insurance required', 'Music until midnight'],
    cancellationPolicy: 'strict',
    isActive: true,
    isVerified: true
  },
  {
    name: 'Sunset Beach Club',
    description: 'Exclusive beachfront venue with panoramic ocean views. Features a private beach area, tiki bar, and sunset ceremony deck.',
    owner: null,
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800'
    ],
    amenities: ['Beach Access', 'Tiki Bar', 'Restrooms', 'Parking', 'Sound System', 'Sunset Deck', 'Bonfire Pit', 'Outdoor Shower'],
    capacity: { min: 40, max: 200 },
    pricing: { basePrice: 4500, currency: 'USD', priceType: 'daily' },
    location: {
      address: '101 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA',
      coordinates: { type: 'Point', coordinates: [-80.1918, 25.7617] },
      nearbyLandmarks: ['South Beach', 'Ocean Drive', 'Art Deco District']
    },
    availability: { isAvailable: true, blockedDates: [] },
    rules: ['Beach cleanup required', 'No glass on beach', 'Alcohol from venue only', 'Events end by 11 PM'],
    cancellationPolicy: 'moderate',
    isActive: true,
    isVerified: true
  },
  {
    name: 'Mountain View Lodge',
    description: 'Rustic mountain lodge with stone fireplace, timber beams, and panoramic mountain views. Cozy atmosphere for intimate gatherings and retreats.',
    owner: null,
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800'
    ],
    amenities: ['Fireplace', 'Parking', 'Kitchen', 'Restrooms', 'Mountain Views', 'Outdoor Deck', 'BBQ Area', 'WiFi'],
    capacity: { min: 15, max: 80 },
    pricing: { basePrice: 1500, currency: 'USD', priceType: 'daily' },
    location: {
      address: '202 Peak Road',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'USA',
      coordinates: { type: 'Point', coordinates: [-104.9903, 39.7392] },
      nearbyLandmarks: ['Rocky Mountains', 'Red Rocks', 'Downtown Denver']
    },
    availability: { isAvailable: true, blockedDates: [] },
    rules: ['Fire safety compliance', 'No outside firewood', 'Quiet hours after 10 PM', 'Pet friendly with deposit'],
    cancellationPolicy: 'flexible',
    isActive: true,
    isVerified: true
  },
  {
    name: 'Historic Mansion Estate',
    description: 'Stunning historic mansion with grand architecture, manicured gardens, and luxurious interiors. Ideal for upscale weddings and gala events.',
    owner: null,
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
    ],
    amenities: ['Parking', 'Gardens', 'Ballroom', 'Library', 'Bridal Suite', 'Catering Kitchen', 'Restrooms', 'Climate Control', 'Valet'],
    capacity: { min: 50, max: 250 },
    pricing: { basePrice: 5000, currency: 'USD', priceType: 'daily' },
    location: {
      address: '303 Heritage Lane',
      city: 'Charleston',
      state: 'SC',
      zipCode: '29401',
      country: 'USA',
      coordinates: { type: 'Point', coordinates: [-79.9311, 32.7765] },
      nearbyLandmarks: ['Historic District', 'Waterfront Park', 'King Street']
    },
    availability: { isAvailable: true, blockedDates: [] },
    rules: ['Historic preservation rules', 'Approved vendors only', 'No tape on walls', 'Events end by 11 PM'],
    cancellationPolicy: 'strict',
    isActive: true,
    isVerified: true
  }
];

const sampleUsers = [
  { name: 'Admin User', email: 'admin@partyplot.com', password: 'admin123', role: 'admin' as const, phone: '+1-555-0100' },
  { name: 'Venue Owner', email: 'owner@partyplot.com', password: 'owner123', role: 'venue_owner' as const, phone: '+1-555-0101' },
  { name: 'John Doe', email: 'john@partyplot.com', password: 'user123', role: 'user' as const, phone: '+1-555-0102' },
  { name: 'Jane Smith', email: 'jane@partyplot.com', password: 'user123', role: 'user' as const, phone: '+1-555-0103' },
  { name: 'Mike Johnson', email: 'mike@partyplot.com', password: 'user123', role: 'user' as const, phone: '+1-555-0104' }
];

const seedDatabase = async (): Promise<void> => {
  try {
    await User.deleteMany({});
    await Venue.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    console.log('🗑️  Cleared existing data');

    const createdUsers = await User.create(sampleUsers);
    console.log(`👥 Created ${createdUsers.length} users`);

    const adminUser = createdUsers.find(u => u.role === 'admin');
    const ownerUser = createdUsers.find(u => u.role === 'venue_owner');

    const venuesWithOwner = sampleVenues.map((venue, index) => ({
      ...venue,
      owner: ownerUser?._id || adminUser?._id
    }));

    const createdVenues = await Venue.create(venuesWithOwner);
    console.log(`🏢 Created ${createdVenues.length} venues`);

    const user1 = createdUsers.find(u => u.email === 'john@partyplot.com');
    const user2 = createdUsers.find(u => u.email === 'jane@partyplot.com');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 45);

    const sampleBookings = [
      {
        user: user1?._id,
        venue: createdVenues[0]._id,
        eventDetails: { eventName: 'Sarah & Mike Wedding', eventType: 'Wedding', expectedGuests: 150 },
        dates: { startDate: futureDate, endDate: futureDate, startTime: '16:00', endTime: '23:00' },
        pricing: { basePrice: 2500, additionalCharges: [], discount: 0, tax: 200, total: 2700, currency: 'USD' },
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        user: user2?._id,
        venue: createdVenues[1]._id,
        eventDetails: { eventName: 'Summer Birthday Bash', eventType: 'Birthday', expectedGuests: 80 },
        dates: { startDate: futureDate2, endDate: futureDate2, startTime: '14:00', endTime: '22:00' },
        pricing: { basePrice: 1800, additionalCharges: [], discount: 0, tax: 144, total: 1944, currency: 'USD' },
        status: 'pending',
        paymentStatus: 'pending'
      }
    ];

    const createdBookings = await Booking.create(sampleBookings);
    console.log(`📅 Created ${createdBookings.length} bookings`);

    const sampleReviews = [
      {
        user: user1?._id,
        venue: createdVenues[0]._id,
        booking: createdBookings[0]._id,
        rating: { overall: 5, cleanliness: 5, service: 5, value: 4, location: 5 },
        comment: 'Absolutely stunning venue! The staff was incredible and the space was perfect for our wedding. Highly recommend!',
        images: [],
        isVerified: true
      },
      {
        user: user2?._id,
        venue: createdVenues[1]._id,
        booking: createdBookings[1]._id,
        rating: { overall: 4, cleanliness: 4, service: 4, value: 5, location: 5 },
        comment: 'Beautiful riverside location. Great value for money and the garden area is gorgeous for photos.',
        images: [],
        isVerified: true
      }
    ];

    const createdReviews = await Review.create(sampleReviews);
    console.log(`⭐ Created ${createdReviews.length} reviews`);

    for (const review of createdReviews) {
      const venueReviews = await Review.find({ venue: review.venue });
      const avgRating = venueReviews.reduce((sum, r) => sum + r.rating.overall, 0) / venueReviews.length;
      await Venue.findByIdAndUpdate(review.venue, {
        'rating.average': Math.round(avgRating * 10) / 10,
        'rating.count': venueReviews.length
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('  Admin: admin@partyplot.com / admin123');
    console.log('  Owner: owner@partyplot.com / owner123');
    console.log('  User:  john@partyplot.com / user123');
    console.log('  User:  jane@partyplot.com / user123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

const runSeed = async (): Promise<void> => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/party-plot-booker';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    await seedDatabase();
  } catch (error) {
    console.error('Failed to connect:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runSeed();