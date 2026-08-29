import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, ApiError, VenueFilters, BookingFormData, Booking, Venue, Review, User, PaginatedResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),
  
  updateProfile: (data: Partial<User>) => api.put<{ success: boolean; user: User }>('/auth/profile', data),
  
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
  
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

export const venueApi = {
  getAll: (filters: VenueFilters = {}) =>
    api.get<PaginatedResponse<Venue>>('/venues', { params: filters }),
  
  getNearby: (lat: number, lng: number, radius = 50000, limit = 10) =>
    api.get<{ success: boolean; count: number; venues: Venue[] }>('/venues/nearby', {
      params: { lat, lng, radius, limit }
    }),
  
  getOne: (id: string) =>
    api.get<{ success: boolean; venue: Venue }>(`/venues/${id}`),
  
  create: (data: FormData) =>
    api.post<{ success: boolean; venue: Venue }>('/venues', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id: string, data: Partial<Venue>) =>
    api.put<{ success: boolean; venue: Venue }>(`/venues/${id}`, data),
  
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/venues/${id}`),
  
  getMyVenues: () =>
    api.get<{ success: boolean; count: number; venues: Venue[] }>('/venues/my-venues'),
  
  checkAvailability: (id: string, startDate: string, endDate: string) =>
    api.get<{ success: boolean; isAvailable: boolean; blockedDates: string[]; bookedDates: string[] }>(
      `/venues/${id}/availability`,
      { params: { startDate, endDate } }
    ),
  
  toggleFavorite: (id: string) =>
    api.post<{ success: boolean; isFavorite: boolean; favorites: string[] }>(`/venues/${id}/favorite`),
};

export const bookingApi = {
  create: (data: BookingFormData) =>
    api.post<{ success: boolean; booking: Booking }>('/bookings', data),
  
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<Booking>>('/bookings', { params }),
  
  getOne: (id: string) =>
    api.get<{ success: boolean; booking: Booking }>(`/bookings/${id}`),
  
  updateStatus: (id: string, status: Booking['status']) =>
    api.put<{ success: boolean; booking: Booking }>(`/bookings/${id}/status`, { status }),
  
  cancel: (id: string, reason?: string) =>
    api.delete<{ success: boolean; booking: Booking; refundAmount: number }>(`/bookings/${id}`, { data: { reason } }),
  
  addCommunication: (id: string, message: string) =>
    api.post<{ success: boolean; communicationLog: Booking['communicationLog'] }>(`/bookings/${id}/communicate`, { message }),
  
  getVenueBookings: (venueId: string, params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<Booking>>(`/bookings/venue/${venueId}`, { params }),
};

export const reviewApi = {
  getVenueReviews: (venueId: string, params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }) =>
    api.get<PaginatedResponse<Review> & { ratingDistribution: { _id: number; count: number }[] }>(
      `/reviews/venue/${venueId}`,
      { params }
    ),
  
  create: (data: { venue: string; booking: string; rating: Review['rating']; comment: string; images?: string[] }) =>
    api.post<{ success: boolean; review: Review }>('/reviews', data),
  
  update: (id: string, data: Partial<Review>) =>
    api.put<{ success: boolean; review: Review }>(`/reviews/${id}`, data),
  
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/reviews/${id}`),
  
  addOwnerResponse: (id: string, message: string) =>
    api.post<{ success: boolean; review: Review }>(`/reviews/${id}/response`, { message }),
  
  markHelpful: (id: string) =>
    api.post<{ success: boolean; helpfulCount: number }>(`/reviews/${id}/helpful`),
};

export default api;