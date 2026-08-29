import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiUsers, FiStar, FiHeart, FiHeart as FiHeartFilled, FiCheckCircle } from 'react-icons/fi';
import { useReducedMotion } from '../../hooks/useAnimations';
import { Venue } from '../../types';
import { useLocationContext } from '../../context/LocationContext';
import { formatPriceByLocation } from '../../utils/currency';
import { Card, CardImage, CardBadge, Button } from '../ui';

interface VenueCardProps {
  venue: Venue;
  variant?: 'default' | 'compact' | 'featured';
  showFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
}

// Helper to safely get string label from string or object amenity
const getAmenityName = (amenity: any): string => {
  if (typeof amenity === 'string') return amenity;
  if (typeof amenity === 'object' && amenity !== null) {
    return amenity.name || amenity.label || amenity.title || '';
  }
  return '';
};

export const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  variant = 'default',
  showFavorite = true,
  onFavoriteToggle,
}) => {
  const reducedMotion = useReducedMotion();
  const { countryCode } = useLocationContext();
  const isFavorite = venue?.isFavorite || false;

  const getAmenityIcon = (amenityName: string) => {
    const icons: Record<string, React.ReactNode> = {
      WiFi: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
      Parking: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
      Kitchen: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
      'Sound System': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-1.806-.904a.5.5 0 11.224-.97l2.64 1.32a3 3 0 100-4.319l-2.64-1.32a.5.5 0 11-.224-.97l1.806-.904a3 3 0 102.977-2.63zM10 19l3.999-12" /></svg>,
      Stage: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      Lighting: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      Catering: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
      Restrooms: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
      'Wheelchair Accessible': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
      'Climate Control': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      'Outdoor Space': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>,
      Bar: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    };
    return icons[amenityName] || <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
  };

  const amenitiesList = Array.isArray(venue?.amenities) ? venue.amenities : [];
  const imageUrl = venue?.images?.[0] || '/placeholder-venue.jpg';

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: reducedMotion ? 0.01 : 0.4 }}
        className="flex gap-4 p-4 bg-white rounded-xl border border-surface-200 hover:border-brand-200 hover:shadow-elegant transition-all"
      >
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <img src={imageUrl} alt={venue?.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-900 truncate">{venue?.name}</h3>
          <p className="text-sm text-surface-500 mt-1 truncate">
            {venue?.location?.city}, {venue?.location?.state}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-medium text-brand-600">
              {formatPriceByLocation(venue?.pricing?.basePrice || 0, countryCode)}/{venue?.pricing?.priceType}
            </span>
            <span className="flex items-center gap-1 text-sm text-surface-500">
              <FiUsers className="w-4 h-4" />
              {venue?.capacity?.max}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: reducedMotion ? 0.01 : 0.5 }}
      className="group"
    >
      <Card className="overflow-hidden" variant="elevated">
        <div className="relative">
          <CardImage src={imageUrl} alt={venue?.name} height="h-56" />

          <div className="absolute top-4 left-4 right-4 flex justify-between">
            {venue?.isVerified && (
              <CardBadge variant="brand" className="flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" />
                Verified
              </CardBadge>
            )}

            {showFavorite && (
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFavoriteToggle?.(venue._id);
                }}
                className="p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-elegant text-surface-600 hover:text-red-500 hover:bg-red-50 transition-all"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? (
                  <FiHeartFilled className="w-5 h-5 text-red-500 fill-current" />
                ) : (
                  <FiHeart className="w-5 h-5" />
                )}
              </motion.button>
            )}
          </div>

          {(venue?.rating?.count ?? 0) > 0 && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-elegant">
              <FiStar className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-surface-900">
                {venue.rating.average.toFixed(1)}
              </span>
              <span className="text-xs text-surface-500">({venue.rating.count})</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
            {venue?.name}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-surface-500">
            <FiMapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {venue?.location?.address}, {venue?.location?.city}, {venue?.location?.state}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {amenitiesList.slice(0, 4).map((amenity: any, idx: number) => {
              const name = getAmenityName(amenity);
              if (!name) return null;

              return (
                <motion.span
                  key={typeof amenity === 'object' && amenity?._id ? amenity._id : `${name}-${idx}`}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-100 text-surface-600 text-xs rounded-lg hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-surface-200 transition-all"
                >
                  {getAmenityIcon(name)}
                  {name}
                </motion.span>
              );
            })}
            {amenitiesList.length > 4 && (
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-100 text-surface-600 text-xs rounded-lg hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-surface-200 transition-all"
              >
                +{amenitiesList.length - 4} more
              </motion.span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-surface-500">
              <span className="flex items-center gap-1">
                <FiUsers className="w-4 h-4" />
                Up to {venue?.capacity?.max} guests
              </span>
              <span className="flex items-center gap-1">
                <FiStar className="w-4 h-4 fill-amber-400 text-amber-400" />
                {venue?.rating?.average?.toFixed(1) || '0.0'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-surface-900">
                {formatPriceByLocation(venue?.pricing?.basePrice || 0, countryCode)}
                <span className="text-sm font-normal text-surface-500">
                  /{venue?.pricing?.priceType}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0">
          <Link to={`/venues/${venue?._id}`} className="w-full">
            <Button
              variant="primary"
              fullWidth
              size="md"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
            >
              View Details
            </Button>
          </Link>
        </div>
      </Card>
    </motion.article>
  );
};

interface VenueCardSkeletonProps {
  variant?: 'default' | 'compact';
}

export const VenueCardSkeleton: React.FC<VenueCardSkeletonProps> = ({ variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className="flex gap-4 p-4 bg-white rounded-xl border border-surface-200">
        <div className="w-24 h-24 flex-shrink-0 rounded-xl skeleton" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 skeleton-title" />
          <div className="h-4 w-1/2 skeleton-text" />
          <div className="h-4 w-1/3 skeleton-text" />
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-elegant">
        <div className="h-56 skeleton-card" />
        <div className="p-6 space-y-4">
          <div className="h-6 w-3/4 skeleton-title" />
          <div className="h-4 w-1/2 skeleton-text" />
          <div className="h-8 w-full skeleton" />
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="h-4 w-24 skeleton-text" />
              <div className="h-4 w-20 skeleton-text" />
            </div>
            <div className="h-8 w-24 skeleton" />
          </div>
        </div>
        <div className="px-6 pb-6 pt-0">
          <div className="h-12 w-full skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
};