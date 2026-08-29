import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFilter, FiGrid, FiMapPin, FiDollarSign, FiUsers, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useReducedMotion } from '../../hooks/useAnimations';
import { VenueFilters as VenueFiltersType } from '../../types';
import { Button, Input, Select } from '../ui';
import { classNames } from '../../utils/helpers';

const ALL_AMENITIES = [
  'WiFi', 'Parking', 'Kitchen', 'Sound System', 'Stage', 'Lighting',
  'Catering', 'Restrooms', 'Wheelchair Accessible', 'Climate Control',
  'Outdoor Space', 'Bar', 'Dance Floor', 'Projector', 'Rooftop Access',
];

const PRICE_RANGES = [
  { label: 'Any Price', min: undefined, max: undefined },
  { label: 'Under $1,000', min: 0, max: 1000 },
  { label: '$1,000 - $2,500', min: 1000, max: 2500 },
  { label: '$2,500 - $5,000', min: 2500, max: 5000 },
  { label: '$5,000 - $10,000', min: 5000, max: 10000 },
  { label: 'Over $10,000', min: 10000, max: undefined },
];

const CAPACITY_RANGES = [
  { label: 'Any Capacity', min: undefined, max: undefined },
  { label: 'Up to 50', min: 0, max: 50 },
  { label: '50 - 100', min: 50, max: 100 },
  { label: '100 - 200', min: 100, max: 200 },
  { label: '200 - 300', min: 200, max: 300 },
  { label: '300+', min: 300, max: undefined },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest First' },
  { value: '-createdAt', label: 'Oldest First' },
  { value: 'pricing.basePrice', label: 'Price: Low to High' },
  { value: '-pricing.basePrice', label: 'Price: High to Low' },
  { value: '-rating.average', label: 'Highest Rated' },
  { value: 'name', label: 'Name A-Z' },
];

interface VenueFiltersProps {
  filters: VenueFiltersType;
  onFiltersChange: (filters: VenueFiltersType) => void;
  onSearch: (query: string) => void;
  venueCount: number;
  isLoading?: boolean;
  showMapToggle?: boolean;
  onMapToggle?: () => void;
  isMapView?: boolean;
}

export const VenueFilters: React.FC<VenueFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  venueCount,
  isLoading,
  showMapToggle,
  onMapToggle,
  isMapView,
}) => {
  const reducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters?.search || '');

  // Normalize amenities list to always be an array of strings
  const currentAmenities: string[] = Array.isArray(filters?.amenities)
    ? filters.amenities.map((item: any) => (typeof item === 'object' && item !== null ? item.name || item._id || '' : String(item))).filter(Boolean)
    : [];

  const hasActiveFilters = Boolean(
    filters?.city ||
    filters?.state ||
    filters?.minPrice !== undefined ||
    filters?.maxPrice !== undefined ||
    filters?.minCapacity !== undefined ||
    filters?.maxCapacity !== undefined ||
    currentAmenities.length > 0
  );

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    const debounced = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(debounced);
  };

  const handleFilterChange = (key: keyof VenueFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    } as VenueFiltersType);
    setLocalSearch('');
  };

  const toggleAmenity = (amenity: string) => {
    const updated = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    handleFilterChange('amenities', updated);
  };

  return (
    <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-16 z-40">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4 flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative flex-1 max-w-md"
            >
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
              <Input
                placeholder="Search venues, cities, landmarks..."
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </motion.div>

            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                leftIcon={isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              >
                Filters
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-surface-500">
              <span>{venueCount} {venueCount === 1 ? 'venue' : 'venues'} found</span>
            </div>

            {showMapToggle && onMapToggle && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={isMapView ? <FiGrid className="w-4 h-4" /> : <FiMapPin className="w-4 h-4" />}
                onClick={onMapToggle}
              >
                {isMapView ? 'List' : 'Map'}
              </Button>
            )}

            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={clearAllFilters}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  Clear all
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {(isExpanded || !isExpanded) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className={classNames(
                'lg:static lg:block lg:opacity-100 lg:h-auto',
                isExpanded ? 'block' : 'hidden'
              )}
            >
              <div className="pt-4 border-t border-surface-200 dark:border-surface-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <Select
                      label="Sort by"
                      value={filters?.sortBy || 'createdAt'}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      options={SORT_OPTIONS}
                      placeholder="Select sort order"
                    />
                  </div>

                  <div>
                    <Select
                      label="Price Range"
                      value={filters?.minPrice !== undefined && filters?.maxPrice !== undefined ? `${filters.minPrice}-${filters.maxPrice}` : 'any'}
                      onChange={(e) => {
                        if (e.target.value === 'any') {
                          handleFilterChange('minPrice', undefined);
                          handleFilterChange('maxPrice', undefined);
                        } else {
                          const [min, max] = e.target.value.split('-').map(Number);
                          handleFilterChange('minPrice', min);
                          handleFilterChange('maxPrice', max);
                        }
                      }}
                      options={PRICE_RANGES.map((r) => ({
                        value: r.min !== undefined && r.max !== undefined ? `${r.min}-${r.max}` : 'any',
                        label: r.label,
                      }))}
                    />
                  </div>

                  <div>
                    <Select
                      label="Capacity"
                      value={filters?.minCapacity !== undefined && filters?.maxCapacity !== undefined ? `${filters.minCapacity}-${filters.maxCapacity}` : 'any'}
                      onChange={(e) => {
                        if (e.target.value === 'any') {
                          handleFilterChange('minCapacity', undefined);
                          handleFilterChange('maxCapacity', undefined);
                        } else {
                          const [min, max] = e.target.value.split('-').map(Number);
                          handleFilterChange('minCapacity', min);
                          handleFilterChange('maxCapacity', max);
                        }
                      }}
                      options={CAPACITY_RANGES.map((r) => ({
                        value: r.min !== undefined && r.max !== undefined ? `${r.min}-${r.max}` : 'any',
                        label: r.label,
                      }))}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        leftIcon={showAdvanced ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                        className="flex-1"
                      >
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
                      </Button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="label">Amenities</label>
                        <div className="flex flex-wrap gap-2">
                          {ALL_AMENITIES.map((amenity) => {
                            const isChecked = currentAmenities.includes(amenity);
                            return (
                              <motion.label
                                key={amenity}
                                whileHover={{ backgroundColor: isChecked ? '#dcfce7' : '#f0fdf4' }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors border ${
                                  isChecked
                                    ? 'bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-700'
                                    : 'bg-surface-100 text-surface-600 border-surface-200 hover:border-primary-300 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={currentAmenities.includes(amenity)}
                                  onChange={() => toggleAmenity(amenity)}
                                  className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                                />
                                {amenity}
                              </motion.label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="City"
                          placeholder="Enter city"
                          value={filters?.city || ''}
                          onChange={(e) => handleFilterChange('city', e.target.value)}
                        />
                        <Input
                          label="State"
                          placeholder="Enter state"
                          value={filters?.state || ''}
                          onChange={(e) => handleFilterChange('state', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Available from"
                          type="date"
                          value={filters?.startDate ? String(filters.startDate).split('T')[0] : ''}
                          onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Input
                          label="Available until"
                          type="date"
                          value={filters?.endDate ? String(filters.endDate).split('T')[0] : ''}
                          onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};