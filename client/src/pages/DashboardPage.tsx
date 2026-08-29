import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiCalendar, FiDollarSign, FiUsers, FiTrendingUp, FiActivity, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { useReducedMotion } from '../hooks/useAnimations';
import { useAuth } from '../context/AuthContext';
import { useVenues } from '../context/VenueContext';
import { useBookings } from '../context/BookingContext';
import { Button, Card, CardBadge, Modal, Input, Select, Textarea } from '../components/ui';
import { formatCurrency, formatDate, formatTime, getRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import { classNames } from '../utils/helpers';

const statusStyles = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  cancelled: 'badge-danger',
  completed: 'badge-primary',
  rejected: 'badge-danger',
} as const;

export const DashboardPage: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { user, isAuthenticated } = useAuth();
  const { venues, isLoading: venuesLoading, fetchMyVenues, createVenue, deleteVenue } = useVenues();
  const { venueBookings, isLoading: bookingsLoading, fetchVenueBookings, updateBookingStatus } = useBookings();
  const [activeTab, setActiveTab] = useState<'overview' | 'venues' | 'bookings' | 'analytics'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [deletingVenue, setDeletingVenue] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newVenueForm, setNewVenueForm] = useState({
    name: '',
    description: '',
    capacity: { min: 10, max: 100 },
    pricing: { basePrice: 0, priceType: 'daily' as const },
    location: { address: '', city: '', state: '', zipCode: '', coordinates: [0, 0] as [number, number] },
    amenities: [] as string[],
    rules: [] as string[],
    cancellationPolicy: 'moderate' as const,
    images: [] as File[],
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'venue_owner') {
      fetchMyVenues();
    }
  }, [isAuthenticated, user, fetchMyVenues]);

  useEffect(() => {
    if (venues.length > 0) {
      fetchVenueBookings(venues[0]._id);
    }
  }, [venues, fetchVenueBookings]);

  if (!isAuthenticated || user?.role !== 'venue_owner') {
    return <Navigate to="/" replace />;
  }

  const totalRevenue = venueBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.pricing.total, 0);

  const pendingBookings = venueBookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = venueBookings.filter(b => b.status === 'confirmed').length;

  const stats = [
    { label: 'Total Venues', value: venues.length, icon: FiActivity, color: 'primary' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: FiDollarSign, color: 'accent' },
    { label: 'Pending Bookings', value: pendingBookings, icon: FiClock, color: 'warning' },
    { label: 'Confirmed', value: confirmedBookings, icon: FiCheckCircle, color: 'success' },
  ];

  const ALL_AMENITIES = ['WiFi', 'Parking', 'Kitchen', 'Sound System', 'Stage', 'Lighting', 'Catering', 'Restrooms', 'Wheelchair Accessible', 'Climate Control', 'Outdoor Space', 'Bar', 'Dance Floor', 'Projector', 'Rooftop Access'];

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newVenueForm).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => formData.append(key, v));
      } else if (key === 'images') {
        value.forEach((file: File) => formData.append('images', file));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });
    try {
      await createVenue(formData);
      toast.success('Venue created successfully!');
      setShowCreateModal(false);
      setNewVenueForm({
        name: '', description: '', capacity: { min: 10, max: 100 },
        pricing: { basePrice: 0, priceType: 'daily' },
        location: { address: '', city: '', state: '', zipCode: '', coordinates: [0, 0] },
        amenities: [], rules: [], cancellationPolicy: 'moderate', images: [],
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create venue');
    }
  };

  const handleDeleteVenue = async (id: string) => {
    try {
      await deleteVenue(id);
      toast.success('Venue deleted');
      setDeletingVenue(null);
    } catch (error: any) {
      toast.error('Failed to delete venue');
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: any) => {
    try {
      await updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status}`);
    } catch (error: any) {
      toast.error('Failed to update booking');
    }
  };

  return (
    <div className="bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      <div className="container-main py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">Host Dashboard</h1>
              <p className="text-surface-600 dark:text-surface-400 mt-1">Manage your venues and bookings</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<FiPlus className="w-4 h-4" />}
            >
              Add Venue
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={classNames(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  stat.color === 'primary' && 'bg-primary-100 text-primary-600',
                  stat.color === 'accent' && 'bg-accent-100 text-accent-600',
                  stat.color === 'warning' && 'bg-yellow-100 text-yellow-600',
                  stat.color === 'success' && 'bg-green-100 text-green-600',
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex gap-8 px-6" role="tablist" aria-label="Dashboard sections">
              {[
                { id: 'overview', label: 'Overview', icon: FiActivity },
                { id: 'venues', label: 'My Venues', icon: FiEye },
                { id: 'bookings', label: 'Bookings', icon: FiCalendar },
                { id: 'analytics', label: 'Analytics', icon: FiTrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={classNames(
                    'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:border-surface-300'
                  )}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
                  {bookingsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
                      ))}
                    </div>
                  ) : venueBookings.length === 0 ? (
                    <Card variant="outlined" padding="xl" className="text-center">
                      <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No bookings yet. List your first venue to start receiving bookings!</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {venueBookings.slice(0, 5).map((booking) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: reducedMotion ? 0 : 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                              <FiCalendar className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.eventDetails.eventName}</p>
                              <p className="text-sm text-gray-500">{(booking.venue as any)?.name || 'Venue'} • {formatDate(booking.dates.startDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <CardBadge variant={statusStyles[booking.status]}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </CardBadge>
                            <span className="font-semibold text-gray-900">{formatCurrency(booking.pricing.total)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card variant="outlined" padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiPlus className="w-5 h-5 text-primary-600" />
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="secondary" onClick={() => setShowCreateModal(true)} leftIcon={<FiPlus className="w-4 h-4" />}>
                        Add Venue
                      </Button>
                      <Button variant="secondary" onClick={() => setActiveTab('venues')} leftIcon={<FiEye className="w-4 h-4" />}>
                        Manage Venues
                      </Button>
                      <Button variant="secondary" onClick={() => setActiveTab('bookings')} leftIcon={<FiCalendar className="w-4 h-4" />}>
                        View Bookings
                      </Button>
                      <Button variant="secondary" onClick={() => setActiveTab('analytics')} leftIcon={<FiTrendingUp className="w-4 h-4" />}>
                        Analytics
                      </Button>
                    </div>
                  </Card>

                  <Card variant="outlined" padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiTrendingUp className="w-5 h-5 text-accent-600" />
                      Performance Tips
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><FiCheckCircle className="w-4 h-4 text-green-500" /> Add high-quality photos to increase bookings</li>
                      <li className="flex items-center gap-2"><FiCheckCircle className="w-4 h-4 text-green-500" /> Respond to inquiries within 1 hour</li>
                      <li className="flex items-center gap-2"><FiCheckCircle className="w-4 h-4 text-green-500" /> Keep calendar updated</li>
                      <li className="flex items-center gap-2"><FiCheckCircle className="w-4 h-4 text-green-500" /> Encourage guest reviews</li>
                    </ul>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'venues' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">My Venues ({venues.length})</h2>
                  <Button variant="primary" onClick={() => setShowCreateModal(true)} leftIcon={<FiPlus className="w-4 h-4" />}>
                    Add Venue
                  </Button>
                </div>
                {venuesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse h-80 bg-gray-100 rounded-2xl" />
                    ))}
                  </div>
                ) : venues.length === 0 ? (
                  <Card variant="outlined" padding="xl" className="text-center">
                    <FiEye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No venues yet</h3>
                    <p className="text-gray-500 mb-6">Create your first venue listing to start earning</p>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)} leftIcon={<FiPlus className="w-4 h-4" />}>
                      Add Your First Venue
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                      <motion.div
                        key={venue._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reducedMotion ? 0 : 0.1 }}
                        className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-48">
                          <img src={venue.images[0] || '/placeholder-venue.jpg'} alt={venue.name} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Button variant="ghost" size="sm" className="bg-white/90" onClick={() => setEditingVenue(venue)}>
                              <FiEdit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="bg-white/90" onClick={() => setDeletingVenue(venue._id)}>
                              <FiTrash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900">{venue.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{venue.location.city}, {venue.location.state}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-semibold text-primary-600">{formatCurrency(venue.pricing.basePrice)}/{venue.pricing.priceType}</span>
                            <CardBadge variant={venue.isActive ? 'success' : 'warning'}>
                              {venue.isActive ? 'Active' : 'Inactive'}
                            </CardBadge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">All Bookings</h2>
                <div className="space-y-3">
                  {bookingsLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-xl" />
                      ))}
                    </div>
                  ) : venueBookings.length === 0 ? (
                    <Card variant="outlined" padding="xl" className="text-center">
                      <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No bookings for your venues yet</p>
                    </Card>
                  ) : (
                    venueBookings.map((booking) => (
                      <motion.div
                        key={booking._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-primary-200 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FiCalendar className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{booking.eventDetails.eventName}</p>
                            <p className="text-sm text-gray-500">{(booking.venue as any)?.name || 'Venue'} • {formatDate(booking.dates.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <CardBadge variant={statusStyles[booking.status]}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </CardBadge>
                          <span className="font-semibold text-gray-900">{formatCurrency(booking.pricing.total)}</span>
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                            className="px-3 py-1.5 border border-surface-300 dark:border-surface-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Venue Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card variant="outlined" padding="lg" className="text-center">
                    <FiTrendingUp className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">+23%</p>
                    <p className="text-sm text-gray-500">Booking increase this month</p>
                  </Card>
                  <Card variant="outlined" padding="lg" className="text-center">
                    <FiDollarSign className="w-12 h-12 text-accent-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">${(totalRevenue / 1000).toFixed(1)}K</p>
                    <p className="text-sm text-gray-500">Average revenue per venue</p>
                  </Card>
                  <Card variant="outlined" padding="lg" className="text-center">
                    <FiUsers className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">4.8</p>
                    <p className="text-sm text-gray-500">Average guest rating</p>
                  </Card>
                  <Card variant="outlined" padding="lg" className="text-center">
                    <FiClock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">2.1h</p>
                    <p className="text-sm text-gray-500">Average response time</p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card variant="outlined" padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Booking Trends</h3>
                    <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      Chart placeholder - integrate with Chart.js or Recharts
                    </div>
                  </Card>
                  <Card variant="outlined" padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenue by Venue</h3>
                    <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      Chart placeholder - integrate with Chart.js or Recharts
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Venue"
        size="xl"
      >
        <form onSubmit={handleCreateVenue} className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              label="Venue Name"
              value={newVenueForm.name}
              onChange={(e) => setNewVenueForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Select
              label="Pricing Type"
              value={newVenueForm.pricing.priceType}
              onChange={(e) => setNewVenueForm(prev => ({ ...prev, pricing: { ...prev.pricing, priceType: e.target.value } }))}
              options={[
                { value: 'hourly', label: 'Hourly' },
                { value: 'daily', label: 'Daily' },
                { value: 'event', label: 'Per Event' },
              ]}
            />
            <Input
              label="Base Price"
              type="number"
              min="0"
              value={newVenueForm.pricing.basePrice}
              onChange={(e) => setNewVenueForm(prev => ({ ...prev, pricing: { ...prev.pricing, basePrice: parseFloat(e.target.value) || 0 } }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Capacity"
                type="number"
                min="1"
                value={newVenueForm.capacity.min}
                onChange={(e) => setNewVenueForm(prev => ({ ...prev, capacity: { ...prev.capacity, min: parseInt(e.target.value) || 1 } }))}
              />
              <Input
                label="Max Capacity"
                type="number"
                min="1"
                value={newVenueForm.capacity.max}
                onChange={(e) => setNewVenueForm(prev => ({ ...prev, capacity: { ...prev.capacity, max: parseInt(e.target.value) || 1 } }))}
              />
            </div>
          </div>

          <Textarea
            label="Description"
            value={newVenueForm.description}
            onChange={(e) => setNewVenueForm(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            required
            placeholder="Describe your venue, its unique features, and what makes it perfect for events..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Street Address"
              value={newVenueForm.location.address}
              onChange={(e) => setNewVenueForm(prev => ({ ...prev, location: { ...prev.location, address: e.target.value } }))}
              required
            />
            <Input
              label="City"
              value={newVenueForm.location.city}
              onChange={(e) => setNewVenueForm(prev => ({ ...prev, location: { ...prev.location, city: e.target.value } }))}
              required
            />
            <Input
              label="State"
              value={newVenueForm.location.state}
              onChange={(e) => setNewVenueForm(prev => ({ ...prev, location: { ...prev.location, state: e.target.value } }))}
              required
            />
            <Input
              label="ZIP Code"
              value={newVenueForm.location.zipCode}
              onChange={(e) => setNewVenueForm(prev => ({ ...prev, location: { ...prev.location, zipCode: e.target.value } }))}
              required
            />
          </div>

          <div>
            <label className="label">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className={classNames(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors border',
                    newVenueForm.amenities.includes(amenity)
                      ? 'bg-primary-100 text-primary-800 border-primary-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={newVenueForm.amenities.includes(amenity)}
                    onChange={(e) => setNewVenueForm(prev => ({
                      ...prev,
                      amenities: e.target.checked
                        ? [...prev.amenities, amenity]
                        : prev.amenities.filter(a => a !== amenity)
                    }))}
                    className="w-4 h-4 text-primary-600 border-surface-300 dark:border-surface-600 rounded focus:ring-primary-500"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <Textarea
            label="House Rules (one per line)"
            value={newVenueForm.rules.join('\n')}
            onChange={(e) => setNewVenueForm(prev => ({ ...prev, rules: e.target.value.split('\n').filter(r => r.trim()) }))}
            rows={4}
            placeholder="No smoking&#10;No outside alcohol&#10;Music until 11 PM"
          />

          <Select
            label="Cancellation Policy"
            value={newVenueForm.cancellationPolicy}
            onChange={(e) => setNewVenueForm(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
            options={[
              { value: 'flexible', label: 'Flexible - Full refund up to 24h before' },
              { value: 'moderate', label: 'Moderate - Full refund up to 5 days before' },
              { value: 'strict', label: 'Strict - 50% refund up to 7 days before' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" size="lg" leftIcon={<FiPlus className="w-4 h-4" />}>
              Create Venue
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingVenue}
        onClose={() => setDeletingVenue(null)}
        onConfirm={() => deletingVenue && handleDeleteVenue(deletingVenue)}
        title="Delete Venue"
        message="Are you sure you want to delete this venue? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Event:</span> <span className="font-medium">{selectedBooking.eventDetails.eventName}</span></div>
              <div><span className="text-gray-500">Venue:</span> <span className="font-medium">{(selectedBooking.venue as any)?.name}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDate(selectedBooking.dates.startDate)}</span></div>
              <div><span className="text-gray-500">Time:</span> <span className="font-medium">{formatTime(selectedBooking.dates.startTime)} - {formatTime(selectedBooking.dates.endTime)}</span></div>
              <div><span className="text-gray-500">Guests:</span> <span className="font-medium">{selectedBooking.eventDetails.expectedGuests}</span></div>
              <div><span className="text-gray-500">Total:</span> <span className="font-medium">{formatCurrency(selectedBooking.pricing.total)}</span></div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <select
                value={selectedBooking.status}
                onChange={(e) => handleStatusUpdate(selectedBooking._id, e.target.value)}
                className="input"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

import { ConfirmModal } from '../components/ui';

export default DashboardPage;