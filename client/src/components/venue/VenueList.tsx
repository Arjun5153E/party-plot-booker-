import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiRefreshCw, FiGrid, FiList } from 'react-icons/fi';
import { useReducedMotion, useIntersectionObserver } from '../../hooks/useAnimations';
import { Venue } from '../../types';
import { VenueCard, VenueCardSkeleton } from './VenueCard';
import { VenueFilters } from './VenueFilters';
import { Button } from '../ui';
import { classNames } from '../../utils/helpers';

interface VenueListProps {
  venues: Venue[];
  isLoading: boolean;
  error: string | null;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onSearch: (query: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  totalCount: number;
  showMapToggle?: boolean;
  onMapToggle?: () => void;
  isMapView?: boolean;
  variant?: 'grid' | 'list' | 'masonry';
}

export const VenueList: React.FC<VenueListProps> = ({
  venues,
  isLoading,
  error,
  filters,
  onFiltersChange,
  onSearch,
  onLoadMore,
  hasMore,
  totalCount,
  showMapToggle,
  onMapToggle,
  isMapView,
  variant = 'grid',
}) => {
  const reducedMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(variant === 'list' ? 'list' : 'grid');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const handleIntersect = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  useIntersectionObserver(handleIntersect, { rootMargin: '200px' });

  useEffect(() => {
    setShowLoadMore(hasMore && venues.length > 0);
  }, [hasMore, venues.length]);

  if (isLoading && venues.length === 0) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading venues">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <FiMapPin className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load venues</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button variant="primary" leftIcon={<FiRefreshCw className="w-4 h-4" />} onClick={onLoadMore}>
          Try Again
        </Button>
      </motion.div>
    );
  }

  if (venues.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <FiMapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No venues found</h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your filters or search in a different area
        </p>
        <Button variant="ghost" onClick={() => onFiltersChange({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' })}>
          Clear Filters
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <VenueFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        onSearch={onSearch}
        venueCount={totalCount}
        isLoading={isLoading}
        showMapToggle={showMapToggle}
        onMapToggle={onMapToggle}
        isMapView={isMapView}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">View:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={classNames(
                'p-2 rounded transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={classNames(
                'p-2 rounded transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            role="list"
            aria-label="Venues"
          >
            {venues.map((venue, index) => (
              <motion.div
                key={venue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.3, delay: reducedMotion ? 0 : index * 0.05 }}
              >
                <VenueCard venue={venue} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
            role="list"
            aria-label="Venues"
          >
            {venues.map((venue, index) => (
              <motion.div
                key={venue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.3, delay: reducedMotion ? 0 : index * 0.05 }}
              >
                <VenueCard venue={venue} variant="compact" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showLoadMore && (
        <div ref={loadMoreRef} className="flex justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={onLoadMore}
            disabled={isLoading}
            leftIcon={isLoading && <FiRefreshCw className="w-4 h-4 animate-spin" />}
          >
            {isLoading ? 'Loading...' : `Load More Venues (${venues.length} of ${totalCount})`}
          </Button>
        </div>
      )}
    </div>
  );
};