import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';
import { useReducedMotion } from '../hooks/useAnimations';
import { BookingList } from '../components/booking';
import { useBookings } from '../context/BookingContext';

export const BookingsPage: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { bookings, isLoading, error, fetchBookings } = useBookings();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      <div className="container-main py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <FiCalendar className="w-7 h-7 text-brand-600" />
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-heading">
                My Bookings
              </h1>
              <p className="text-surface-600 dark:text-surface-400 mt-0.5">
                Manage and track all your event bookings
              </p>
            </div>
          </div>
        </motion.div>

        <BookingList
          bookings={bookings}
          isLoading={isLoading}
          error={error}
          onView={(booking) => console.log('View booking:', booking)}
          onCancel={(booking) => console.log('Cancel booking:', booking)}
          onMessage={(booking) => console.log('Message host:', booking)}
          emptyMessage="You don't have any bookings yet. Start exploring venues to book your first event!"
          showFilters={true}
        />
      </div>
    </div>
  );
};

export default BookingsPage;
