import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiGrid } from 'react-icons/fi';
import { useReducedMotion } from '../hooks/useAnimations';
import { VenueList } from '../components/venue';
import { useVenues } from '../context/VenueContext';
import { useLocationContext } from '../context/LocationContext';
import { VenueFilters } from '../types';
import { Button } from '../components/ui';

export const VenuesPage: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { city } = useLocationContext();
  const { 
    venues, 
    isLoading, 
    error, 
    pagination, 
    filters, 
    fetchVenues 
  } = useVenues();
  
  const [currentFilters, setCurrentFilters] = useState<VenueFilters>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  const [isMapView, setIsMapView] = useState(location.pathname === '/venues/map');

  useEffect(() => {
    setIsMapView(location.pathname === '/venues/map');
  }, [location.pathname]);

  useEffect(() => {
    const params: VenueFilters = {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: 12,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!, 10) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : undefined,
      minCapacity: searchParams.get('minCapacity') ? parseInt(searchParams.get('minCapacity')!, 10) : undefined,
      maxCapacity: searchParams.get('maxCapacity') ? parseInt(searchParams.get('maxCapacity')!, 10) : undefined,
      search: searchParams.get('search') || undefined,
    };

    const amenities = searchParams.get('amenities');
    if (amenities) {
      params.amenities = amenities.split(',').map((a) => a.trim()).filter(Boolean);
    }

    setCurrentFilters(params);
    fetchVenues(params);
  }, [searchParams]);

  const handleFiltersChange = (newFilters: VenueFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, String(value));
        }
      }
    });
    setSearchParams(params, { replace: true });
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set('search', query);
    else params.delete('search');
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const handleLoadMore = () => {
    if (pagination && pagination.currentPage < pagination.totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set('page', String(pagination.currentPage + 1));
      setSearchParams(params, { replace: true });
    }
  };

  const hasMore = pagination ? pagination.currentPage < pagination.totalPages : false;
  const totalCount = pagination?.total || 0;

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
              <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white font-display">
                {filters?.search 
                  ? `Search results for "${filters.search}"` 
                  : city 
                  ? `Discover Venues in ${city}` 
                  : 'Discover Venues'}
              </h1>
              <p className="text-surface-600 dark:text-surface-400 mt-1">
                {totalCount} {totalCount === 1 ? 'venue' : 'venues'} found
                {(filters?.city || city) && (
                  <span className="ml-2 text-brand-600 dark:text-brand-400">
                    in {filters?.city || city}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMapView(!isMapView)}
                leftIcon={isMapView ? <FiGrid className="w-4 h-4" /> : <FiMapPin className="w-4 h-4" />}
                className="dark:text-surface-300 dark:hover:bg-surface-800"
              >
                {isMapView ? 'Grid View' : 'Map View'}
              </Button>
            </div>
          </div>
        </motion.div>

        <VenueList
          venues={venues || []}
          isLoading={isLoading}
          error={error}
          filters={currentFilters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          totalCount={totalCount}
          showMapToggle={true}
          onMapToggle={() => setIsMapView(!isMapView)}
          isMapView={isMapView}
        />
      </div>
    </div>
  );
};

export default VenuesPage;