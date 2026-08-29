import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiUsers, FiStar, FiCalendar, FiCheckCircle, FiX, FiHeart, FiHeart as FiHeartFilled, FiShare2, FiChevronLeft, FiChevronRight, FiMapPin as FiMapPinIcon, FiPhone, FiMail, FiArrowLeft, FiShield } from 'react-icons/fi';
import { useReducedMotion, useStaggeredAnimation } from '../hooks/useAnimations';
import { BookingModal } from '../components/booking';
import { VenueCard } from '../components/venue';
import { Button, Card, CardBadge, Modal } from '../components/ui';
import { useVenues } from '../context/VenueContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatTime, truncateText } from '../utils/helpers';
import toast from 'react-hot-toast';
import { classNames } from '../utils/helpers';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Parking: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
  Kitchen: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
  'Sound System': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-1.806-.904a.5.5 0 11.224-.97l2.64 1.32a3 3 0 100-4.319l-2.64-1.32a.5.5 0 11-.224-.97l1.806-.904a3 3 0 102.977-2.63zM10 19l3.999-12" /></svg>,
  Stage: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Lighting: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Catering: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
  Restrooms: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
  'Wheelchair Accessible': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
  'Climate Control': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  'Outdoor Space': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>,
  Bar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  'Dance Floor': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" /></svg>,
  Projector: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>,
  'Rooftop Access': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
};

export const VenueDetailPage: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { id } = useParams<{ id: string }>();
  const { fetchVenue, currentVenue, isLoading, toggleFavorite } = useVenues();
  const { isAuthenticated } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (id) fetchVenue(id);
  }, [id, fetchVenue]);

  const venue = currentVenue;

  if (isLoading && !venue) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="animate-pulse max-w-4xl mx-auto px-4">
          <div className="h-96 rounded-2xl skeleton-card mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 w-1/3 skeleton-title" />
              <div className="h-4 w-full skeleton-text" />
              <div className="h-32 w-full skeleton" />
              <div className="h-32 w-full skeleton" />
            </div>
            <div className="space-y-6">
              <div className="h-64 skeleton-card rounded-2xl" />
              <div className="h-20 skeleton rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <FiX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Venue Not Found</h1>
          <p className="text-surface-500 dark:text-surface-400 mb-6">The venue you're looking for doesn't exist or has been removed.</p>
          <Link to="/venues">
            <Button variant="primary" leftIcon={<FiArrowLeft className="w-4 h-4" />}>
              Browse Venues
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    toast.success('Booking request sent! Check your bookings page for updates.');
  };

  const amenitiesList = venue.amenities || [];
  const rulesList = venue.rules || [];

  return (
    <div className="bg-surface-50 dark:bg-surface-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div className="relative h-96 lg:h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            {venue.images.length > 0 ? (
              <motion.img
                key={imageIndex}
                src={venue.images[imageIndex]}
                alt={`${venue.name} - Image ${imageIndex + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => setShowImageModal(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                <svg className="w-24 h-24 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {venue.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {venue.images.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setImageIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={classNames(
                    'w-2.5 h-2.5 rounded-full transition-all',
                    index === imageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                  )}
                  aria-label={`View image ${index + 1}`}
                  aria-current={index === imageIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          )}

          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <Link to="/venues" className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors">
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(venue._id)}
                className="bg-white/90 backdrop-blur-sm shadow-lg"
              >
                {venue.isFavorite ? (
                  <FiHeartFilled className="w-5 h-5 text-red-500 fill-current" />
                ) : (
                  <FiHeart className="w-5 h-5 text-gray-700" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg"
              >
                <FiShare2 className="w-5 h-5 text-gray-700" />
              </Button>
            </div>
          </div>

          {venue.isVerified && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg">
              <FiCheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-900">Verified Venue</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showImageModal && (
            <Modal
              isOpen={showImageModal}
              onClose={() => setShowImageModal(false)}
              size="full"
              showCloseButton={true}
            >
              <div className="relative aspect-video">
                <motion.img
                  src={venue.images[imageIndex]}
                  alt={`${venue.name} - Image ${imageIndex + 1}`}
                  className="w-full h-full object-contain"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                />
                {venue.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIndex((imageIndex - 1 + venue.images.length) % venue.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <FiChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setImageIndex((imageIndex + 1) % venue.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <FiChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                  </>
                )}
              </div>
            </Modal>
          )}
        </AnimatePresence>

        <div className="container-main -mt-8 lg:-mt-12 pb-16 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.5 }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white font-heading">{venue.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-surface-600 dark:text-surface-300">
                      <span className="flex items-center gap-1">
                        <FiMapPinIcon className="w-4 h-4" />
                        {venue.location.address}, {venue.location.city}, {venue.location.state} {venue.location.zipCode}
                      </span>
                      {venue.location.nearbyLandmarks?.length && (
                        <span className="flex items-center gap-1 ml-4">
                          Near: {venue.location.nearbyLandmarks.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CardBadge variant="primary" className="flex items-center gap-1">
                      <FiStar className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {venue.rating.average.toFixed(1)} ({venue.rating.count} reviews)
                    </CardBadge>
                  </div>
                </div>

                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">{venue.description}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.5, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Card padding="md">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiUsers className="w-5 h-5 text-brand-600" />
                    Capacity & Pricing
                  </h3>
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-surface-600 dark:text-surface-400">Minimum Guests</dt>
                      <dd className="font-medium text-surface-900 dark:text-white">{venue.capacity.min}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-surface-600 dark:text-surface-400">Maximum Guests</dt>
                      <dd className="font-medium text-surface-900 dark:text-white">{venue.capacity.max}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-surface-600 dark:text-surface-400">Base Price</dt>
                      <dd className="font-semibold text-brand-600 text-lg">{formatCurrency(venue.pricing.basePrice)}/{venue.pricing.priceType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-surface-600 dark:text-surface-400">Cancellation Policy</dt>
                      <dd className="font-medium text-surface-900 dark:text-white capitalize">{venue.cancellationPolicy}</dd>
                    </div>
                  </dl>
                </Card>

                <Card padding="md">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-brand-600" />
                    Availability
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-600 dark:text-surface-400">Status</span>
                      <span className={classNames(
                        'font-medium',
                        venue.availability.isAvailable ? 'text-green-600' : 'text-red-600'
                      )}>
                        {venue.availability.isAvailable ? 'Available for booking' : 'Currently unavailable'}
                      </span>
                    </div>
                    {venue.availability.blockedDates.length > 0 && (
                      <div>
                        <span className="text-surface-600 dark:text-surface-400">Blocked Dates: {venue.availability.blockedDates.length}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-surface-600 dark:text-surface-400">Event Types</span>
                      <span className="font-medium text-surface-900 dark:text-white">All types welcome</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.5, delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-brand-600" />
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-3">
                  {amenitiesList.map((amenity) => (
                    <motion.button
                      key={amenity}
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-700 dark:text-surface-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all"
                    >
                      {AMENITY_ICONS[amenity] || <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      {amenity}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {rulesList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.5, delay: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiX className="w-5 h-5 text-red-500" />
                    House Rules
                  </h3>
                  <ul className="space-y-2">
                    {rulesList.map((rule, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: reducedMotion ? 0 : index * 0.05 }}
                        className="flex items-center gap-3 text-surface-600 dark:text-surface-400"
                      >
                        <FiX className="w-5 h-5 text-red-400 flex-shrink-0" />
                        {rule}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.5, delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiMapPinIcon className="w-5 h-5 text-brand-600" />
                  Location
                </h3>
                <Card variant="outlined" padding="md">
                  <div className="aspect-video rounded-xl bg-surface-100 dark:bg-surface-800 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-surface-400 dark:text-surface-500">
                      <FiMapPinIcon className="w-12 h-12" />
                      <p className="ml-2">Map view would be here</p>
                    </div>
                  </div>
                  <address className="mt-4 not-italic text-surface-600 dark:text-surface-400">
                    <p className="font-medium text-surface-900 dark:text-white">{venue.name}</p>
                    <p>{venue.location.address}</p>
                    <p>{venue.location.city}, {venue.location.state} {venue.location.zipCode}</p>
                    <p className="mt-2">
                      <a href={`tel:${venue.owner.phone || ''}`} className="text-brand-600 hover:underline flex items-center gap-1">
                        <FiPhone className="w-4 h-4" /> Contact Host
                      </a>
                    </p>
                  </address>
                </Card>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.5, delay: 0.1 }}
                className="sticky top-24"
              >
                <Card variant="elevated" padding="lg">
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-surface-900 dark:text-white font-heading">
                      {formatCurrency(venue.pricing.basePrice)}
                      <span className="text-base font-normal text-surface-500 dark:text-surface-400">/{venue.pricing.priceType}</span>
                    </p>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">Starting price</p>
                  </div>

                  <div className="space-y-3 mb-6 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-600 dark:text-surface-400">Base price</span>
                      <span className="font-medium text-surface-900 dark:text-white">{formatCurrency(venue.pricing.basePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-600 dark:text-surface-400">Service fee</span>
                      <span className="font-medium text-surface-900 dark:text-white">{formatCurrency(Math.round(venue.pricing.basePrice * 0.1))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-600 dark:text-surface-400">Taxes</span>
                      <span className="font-medium text-surface-900 dark:text-white">{formatCurrency(Math.round(venue.pricing.basePrice * 0.08))}</span>
                    </div>
                    <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-surface-900 dark:text-white">Estimated total</span>
                        <span className="text-brand-600">{formatCurrency(Math.round(venue.pricing.basePrice * 1.18))}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast('Please sign in to book', { icon: '🔐' });
                        return;
                      }
                      setShowBookingModal(true);
                    }}
                    leftIcon={<FiCalendar className="w-5 h-5" />}
                  >
                    Check Availability & Book
                  </Button>

                  <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
                      <FiShield className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Free cancellation up to 48h before</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
                      <FiCheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
                      <FiMail className="w-5 h-5 text-accent-500 flex-shrink-0" />
                      <span>Instant booking confirmation</span>
                    </div>
                  </div>
                </Card>

                <Card variant="outlined" padding="md" className="mt-6">
                  <h3 className="font-semibold text-surface-900 dark:text-white mb-3">Hosted by</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white font-semibold">
                      {venue.owner.name?.charAt(0) || 'H'}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">{venue.owner.name || 'Venue Owner'}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">Verified host</p>
                    </div>
                  </div>
                  <Button variant="ghost" fullWidth className="mt-3" leftIcon={<FiMail className="w-4 h-4" />}>
                    Message Host
                  </Button>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          venue={venue}
          onSuccess={handleBookingSuccess}
        />
      </motion.div>
    </div>
  );
};

export default VenueDetailPage;
