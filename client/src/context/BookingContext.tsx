import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { bookingApi } from '../services/api';
import { Booking, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

interface BookingContextType {
  bookings: Booking[];
  venueBookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
  } | null;
  fetchBookings: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
  fetchBooking: (id: string) => Promise<void>;
  fetchVenueBookings: (venueId: string, params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
  createBooking: (data: any) => Promise<Booking | null>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<Booking | null>;
  cancelBooking: (id: string, reason?: string) => Promise<Booking | null>;
  addCommunication: (id: string, message: string) => Promise<void>;
  clearCurrentBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venueBookings, setVenueBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<BookingContextType['pagination']>(null);

  const fetchBookings = useCallback(async (params?: { page?: number; limit?: number; status?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getAll(params);
      if (response.data.success) {
        setBookings(response.data.bookings || []);
        setPagination({
          total: response.data.total,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch bookings';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBooking = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getOne(id);
      if (response.data.success) {
        setCurrentBooking(response.data.booking);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch booking';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchVenueBookings = useCallback(async (venueId: string, params?: { page?: number; limit?: number; status?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getVenueBookings(venueId, params);
      if (response.data.success) {
        setVenueBookings(response.data.bookings || []);
        setPagination({
          total: response.data.total,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch venue bookings';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (data: any): Promise<Booking | null> => {
    const loadingToast = toast.loading('Creating booking...');
    try {
      const response = await bookingApi.create(data);
      if (response.data.success) {
        toast.success('Booking request sent!', { id: loadingToast });
        return response.data.booking;
      }
      return null;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create booking', { id: loadingToast });
      return null;
    }
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: Booking['status']): Promise<Booking | null> => {
    const loadingToast = toast.loading('Updating booking...');
    try {
      const response = await bookingApi.updateStatus(id, status);
      if (response.data.success) {
        toast.success(`Booking ${status}`, { id: loadingToast });
        return response.data.booking;
      }
      return null;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update booking', { id: loadingToast });
      return null;
    }
  }, []);

  const cancelBooking = useCallback(async (id: string, reason?: string): Promise<Booking | null> => {
    const loadingToast = toast.loading('Cancelling booking...');
    try {
      const response = await bookingApi.cancel(id, reason);
      if (response.data.success) {
        toast.success('Booking cancelled', { id: loadingToast });
        return response.data.booking;
      }
      return null;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking', { id: loadingToast });
      return null;
    }
  }, []);

  const addCommunication = useCallback(async (id: string, message: string) => {
    try {
      const response = await bookingApi.addCommunication(id, message);
      if (response.data.success && currentBooking) {
        setCurrentBooking({
          ...currentBooking,
          communicationLog: response.data.communicationLog
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  }, [currentBooking]);

  const clearCurrentBooking = useCallback(() => {
    setCurrentBooking(null);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        venueBookings,
        currentBooking,
        isLoading,
        error,
        pagination,
        fetchBookings,
        fetchBooking,
        fetchVenueBookings,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        addCommunication,
        clearCurrentBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};