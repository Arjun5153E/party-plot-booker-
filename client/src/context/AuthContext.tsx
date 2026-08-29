import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        try {
          await refreshUser();
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const loadingToast = toast.loading('Signing in...');
    try {
      const response = await authApi.login({ email, password });
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Welcome back!', { id: loadingToast });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed', { id: loadingToast });
      throw error;
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; role?: string }) => {
    const loadingToast = toast.loading('Creating account...');
    try {
      const response = await authApi.register(data);
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Account created successfully!', { id: loadingToast });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed', { id: loadingToast });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>) => {
    const loadingToast = toast.loading('Updating profile...');
    try {
      const response = await authApi.updateProfile(data);
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Profile updated', { id: loadingToast });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed', { id: loadingToast });
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    const loadingToast = toast.loading('Updating password...');
    try {
      await authApi.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed', { id: loadingToast });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};