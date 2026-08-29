import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiDollarSign, FiCheckCircle, FiXCircle, FiClock as FiClockIcon, FiMessageSquare, FiTrash2, FiEye } from 'react-icons/fi';
import { useReducedMotion } from '../../hooks/useAnimations';
import { Booking } from '../../types';
import { Button, Card, CardBadge } from '../ui';
import { formatCurrency, formatDate, formatTime, getRelativeTime } from '../../utils/helpers';

interface BookingCardProps {
  booking: Booking;
  variant?: 'default' | 'compact';
  onView?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onMessage?: (booking: Booking) => void;
}

const statusStyles = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  cancelled: 'badge-danger',
  completed: 'badge-primary',
  rejected: 'badge-danger',
} as const;

const statusIcons = {
  pending: <FiClockIcon className="w-3 h-3" />,
  confirmed: <FiCheckCircle className="w-3 h-3" />,
  cancelled: <FiXCircle className="w-3 h-3" />,
  completed: <FiCheckCircle className="w-3 h-3" />,
  rejected: <FiXCircle className="w-3 h-3" />,
};

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  variant = 'default',
  onView,
  onCancel,
  onMessage,
}) => {
  const reducedMotion = useReducedMotion();
  const venue = booking.venue as any;
  const user = booking.user as any;

  const isUpcoming = new Date(booking.dates.startDate) > new Date();
  const isPast = new Date(booking.dates.endDate) < new Date();
  const canCancel = ['pending', 'confirmed'].includes(booking.status) && isUpcoming;

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
            <img src={venue?.images?.[0] || '/placeholder-venue.jpg'} alt={venue?.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-gray-900 truncate">{venue?.name || 'Venue'}</h4>
              <CardBadge variant={statusStyles[booking.status]} className="flex items-center gap-1">
                {statusIcons[booking.status]}
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </CardBadge>
            </div>
            <p className="text-sm text-gray-500 mt-1 truncate">{booking.eventDetails.eventName}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{formatDate(booking.dates.startDate)}</span>
              <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{formatTime(booking.dates.startTime)} - {formatTime(booking.dates.endTime)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold text-gray-900">{formatCurrency(booking.pricing.total)}</span>
              <div className="flex items-center gap-2">
                {onMessage && (
                  <Button variant="ghost" size="sm" onClick={() => onMessage?.(booking)} leftIcon={<FiMessageSquare className="w-3 h-3" />}>
                    Message
                  </Button>
                )}
                {onView && (
                  <Button variant="ghost" size="sm" onClick={() => onView?.(booking)} leftIcon={<FiEye className="w-3 h-3" />}>
                    View
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card variant="default" hover>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative w-full lg:w-64 flex-shrink-0 rounded-xl overflow-hidden">
            <img src={venue?.images?.[0] || '/placeholder-venue.jpg'} alt={venue?.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
              <CardBadge variant={statusStyles[booking.status]} className="flex items-center gap-1">
                {statusIcons[booking.status]}
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </CardBadge>
              {booking.paymentStatus !== 'paid' && (
                <CardBadge variant="warning">Payment: {booking.paymentStatus}</CardBadge>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between p-4 lg:p-0">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{booking.eventDetails.eventName}</h3>
                  <p className="text-gray-500 mt-1">{venue?.name} • {venue?.location?.city}, {venue?.location?.state}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(booking.pricing.total)}</p>
                  <p className="text-sm text-gray-500">{booking.pricing.currency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(booking.dates.startDate)}</p>
                    <p className="text-xs text-gray-500">to {formatDate(booking.dates.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{formatTime(booking.dates.startTime)} - {formatTime(booking.dates.endTime)}</p>
                    <p className="text-xs text-gray-500">{getDaysDifference(booking.dates.startDate, booking.dates.endDate)} day(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiUsers className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{booking.eventDetails.expectedGuests} guests</p>
                    <p className="text-xs text-gray-500">{booking.eventDetails.eventType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiDollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</p>
                    <p className="text-xs text-gray-500">Payment</p>
                  </div>
                </div>
              </div>

              {booking.eventDetails.specialRequests && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600"><span className="font-medium">Special Requests:</span> {booking.eventDetails.specialRequests}</p>
                </div>
              )}

              {booking.cancellation && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Cancelled</span> on {formatDate(booking.cancellation.cancelledAt)} • Refund: {formatCurrency(booking.cancellation.refundAmount)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 lg:pt-0 lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Booked {getRelativeTime(booking.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                {onMessage && (
                  <Button variant="ghost" size="sm" onClick={() => onMessage?.(booking)} leftIcon={<FiMessageSquare className="w-4 h-4" />}>
                    Message
                  </Button>
                )}
                {onView && (
                  <Button variant="secondary" size="sm" onClick={() => onView?.(booking)} leftIcon={<FiEye className="w-4 h-4" />}>
                    View Details
                  </Button>
                )}
                {canCancel && onCancel && (
                  <Button variant="danger" size="sm" onClick={() => onCancel?.(booking)} leftIcon={<FiTrash2 className="w-4 h-4" />}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.article>
  );
};

interface BookingCardSkeletonProps {
  variant?: 'default' | 'compact';
}

export const BookingCardSkeleton: React.FC<BookingCardSkeletonProps> = ({ variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 flex-shrink-0 rounded-lg skeleton" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 skeleton-title" />
            <div className="h-4 w-1/2 skeleton-text" />
            <div className="h-4 w-1/3 skeleton-text" />
            <div className="h-6 w-1/4 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group animate-pulse">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 flex-shrink-0 h-48 skeleton-card" />
          <div className="flex-1 flex flex-col justify-between p-4 lg:p-0 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="h-6 w-3/4 skeleton-title" />
                  <div className="h-4 w-1/2 skeleton-text" />
                </div>
                <div className="h-10 w-24 skeleton" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 skeleton rounded" />
                    <div className="space-y-1">
                      <div className="h-4 w-16 skeleton-text" />
                      <div className="h-3 w-12 skeleton-text" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="h-4 w-32 skeleton-text" />
              <div className="flex gap-2">
                <div className="h-8 w-20 skeleton rounded-xl" />
                <div className="h-8 w-24 skeleton rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};