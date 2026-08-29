import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiArrowDown } from 'react-icons/fi';
import { useReducedMotion } from '../../hooks/useAnimations';
import { Booking } from '../../types';
import { BookingCard, BookingCardSkeleton } from './BookingCard';
import { Button, Select } from '../ui';
import { classNames } from '../../utils/helpers';

interface BookingListProps {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  onView?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onMessage?: (booking: Booking) => void;
  emptyMessage?: string;
  variant?: 'default' | 'compact';
  showFilters?: boolean;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-dates.startDate', label: 'Event Date: Soonest' },
  { value: 'dates.startDate', label: 'Event Date: Latest' },
];

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  isLoading,
  error,
  onView,
  onCancel,
  onMessage,
  emptyMessage = 'No bookings found',
  variant = 'default',
  showFilters = true,
}) => {
  const reducedMotion = useReducedMotion();
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');

  const filteredBookings = bookings
    .filter(b => !statusFilter || b.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === '-createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'createdAt') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === '-dates.startDate') return new Date(b.dates.startDate).getTime() - new Date(a.dates.startDate).getTime();
      if (sortBy === 'dates.startDate') return new Date(a.dates.startDate).getTime() - new Date(b.dates.startDate).getTime();
      return 0;
    });

  if (isLoading && bookings.length === 0) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading bookings">
        {[...Array(5)].map((_, i) => (
          <BookingCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <FiCalendar className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load bookings</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button variant="primary" leftIcon={<FiArrowDown className="w-4 h-4" />}>
          Refresh
        </Button>
      </motion.div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <FiCalendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 mb-4">
          {statusFilter ? 'Try changing your filter' : 'Get started by booking a venue'}
        </p>
        {!statusFilter && (
          <Button variant="primary" leftIcon={<FiCalendar className="w-4 h-4" />}>
            Browse Venues
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-4 flex-wrap">
            <Select
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_OPTIONS}
              className="w-40"
            />
            <Select
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={SORT_OPTIONS}
              className="w-48"
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {variant === 'compact' ? (
          <motion.div
            key="compact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
            role="list"
            aria-label="Bookings"
          >
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: reducedMotion ? 0 : index * 0.03, duration: 0.2 }}
              >
                <BookingCard
                  booking={booking}
                  variant="compact"
                  onView={onView}
                  onCancel={onCancel}
                  onMessage={onMessage}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
            role="list"
            aria-label="Bookings"
          >
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: reducedMotion ? 0 : index * 0.05, duration: 0.3 }}
              >
                <BookingCard
                  booking={booking}
                  variant="default"
                  onView={onView}
                  onCancel={onCancel}
                  onMessage={onMessage}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};