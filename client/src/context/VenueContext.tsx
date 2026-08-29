import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { venueApi } from '../services/api';
import { Venue, VenueFilters, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

interface VenueContextType {
  venues: Venue[];
  featuredVenues: Venue[];
  currentVenue: Venue | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
  } | null;
  filters: VenueFilters;
  fetchVenues: (filters?: VenueFilters, append?: boolean) => Promise<void>;
  fetchVenue: (id: string) => Promise<void>;
  fetchNearbyVenues: (lat: number, lng: number, radius?: number) => Promise<void>;
  fetchMyVenues: () => Promise<void>;
  createVenue: (data: FormData) => Promise<Venue | null>;
  updateVenue: (id: string, data: Partial<Venue>) => Promise<Venue | null>;
  deleteVenue: (id: string) => Promise<boolean>;
  checkAvailability: (id: string, startDate: string, endDate: string) => Promise<{ isAvailable: boolean; blockedDates: string[]; bookedDates: string[] } | null>;
  toggleFavorite: (id: string) => Promise<void>;
  setFilters: (filters: VenueFilters) => void;
  clearFilters: () => void;
  clearCurrentVenue: () => void;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

const defaultFilters: VenueFilters = {
  page: 1,
  limit: 12,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const VenueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [featuredVenues, setFeaturedVenues] = useState<Venue[]>([]);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<VenueContextType['pagination']>(null);
  const [filters, setFiltersState] = useState<VenueFilters>(defaultFilters);

  const fetchVenues = useCallback(async (newFilters?: VenueFilters, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const mergedFilters = { ...filters, ...newFilters, page: newFilters?.page || 1 };
      const response = await venueApi.getAll(mergedFilters);
      if (response.data.success) {
        if (append) {
          setVenues(prev => [...prev, ...response.data.venues!]);
        } else {
          setVenues(response.data.venues || []);
        }
        setPagination({
          total: response.data.total,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        });
        setFiltersState(mergedFilters);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch venues';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchVenue = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await venueApi.getOne(id);
      if (response.data.success) {
        setCurrentVenue(response.data.venue);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch venue';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNearbyVenues = useCallback(async (lat: number, lng: number, radius = 50000) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await venueApi.getNearby(lat, lng, radius);
      if (response.data.success) {
        setVenues(response.data.venues);
        setFeaturedVenues(response.data.venues.slice(0, 3));
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch nearby venues';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyVenues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await venueApi.getMyVenues();
      if (response.data.success) {
        setVenues(response.data.venues);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch your venues';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVenue = useCallback(async (data: FormData): Promise<Venue | null> => {
    const loadingToast = toast.loading('Creating venue...');
    try {
      const response = await venueApi.create(data);
      if (response.data.success) {
        toast.success('Venue created successfully!', { id: loadingToast });
        return response.data.venue;
      }
      return null;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create venue', { id: loadingToast });
      return null;
    }
  }, []);

  const updateVenue = useCallback(async (id: string, data: Partial<Venue>): Promise<Venue | null> => {
    const loadingToast = toast.loading('Updating venue...');
    try {
      const response = await venueApi.update(id, data);
      if (response.data.success) {
        toast.success('Venue updated successfully!', { id: loadingToast });
        if (currentVenue?._id === id) {
          setCurrentVenue(response.data.venue);
        }
        return response.data.venue;
      }
      return null;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update venue', { id: loadingToast });
      return null;
    }
  }, [currentVenue]);

  const deleteVenue = useCallback(async (id: string): Promise<boolean> => {
    const loadingToast = toast.loading('Deleting venue...');
    try {
      const response = await venueApi.delete(id);
      if (response.data.success) {
        setVenues(prev => prev.filter(v => v._id !== id));
        toast.success('Venue deleted', { id: loadingToast });
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete venue', { id: loadingToast });
      return false;
    }
  }, []);

  const checkAvailability = useCallback(async (id: string, startDate: string, endDate: string) => {
    try {
      const response = await venueApi.checkAvailability(id, startDate, endDate);
      if (response.data.success) {
        return response.data;
      }
      return null;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to check availability');
      return null;
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const response = await venueApi.toggleFavorite(id);
      if (response.data.success) {
        setVenues(prev => prev.map(v => 
          v._id === id ? { ...v, isFavorite: response.data.isFavorite } : v
        ));
        if (currentVenue?._id === id) {
          setCurrentVenue(prev => prev ? { ...prev, isFavorite: response.data.isFavorite } : null);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update favorite');
    }
  }, [currentVenue]);

  const setFilters = useCallback((newFilters: VenueFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const clearCurrentVenue = useCallback(() => {
    setCurrentVenue(null);
  }, []);

  return (
    <VenueContext.Provider
      value={{
        venues,
        featuredVenues,
        currentVenue,
        isLoading,
        error,
        pagination,
        filters,
        fetchVenues,
        fetchVenue,
        fetchNearbyVenues,
        fetchMyVenues,
        createVenue,
        updateVenue,
        deleteVenue,
        checkAvailability,
        toggleFavorite,
        setFilters,
        clearFilters,
        clearCurrentVenue,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
};

export const useVenues = () => {
  const context = useContext(VenueContext);
  if (!context) {
    throw new Error('useVenues must be used within a VenueProvider');
  }
  return context;
};