import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiHeart, FiLogOut, FiBell, FiShield, FiCalendar, FiClock } from 'react-icons/fi';
import { useReducedMotion } from '../hooks/useAnimations';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { useBookings } from '../context/BookingContext';
import { useVenues } from '../context/VenueContext';
import { classNames } from '../utils/helpers';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'bookings', label: 'Bookings', icon: FiHeart },
  { id: 'favorites', label: 'Favorites', icon: FiHeart },
  { id: 'security', label: 'Security', icon: FiShield },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
] as const;

export const ProfilePage: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { user, updateProfile, updatePassword, logout, isAuthenticated } = useAuth();
  const { bookings, isLoading: bookingsLoading } = useBookings();
  const { venues: favoriteVenues } = useVenues();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'favorites' | 'security' | 'notifications'>('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || { street: '', city: '', state: '', zipCode: '' },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsSaving(true);
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      <div className="container-main py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-heading">My Profile</h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">Manage your account settings and preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.5 }}
            className="lg:col-span-1"
          >
            <Card variant="elevated" padding="lg" className="sticky top-24">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h2 className="text-xl font-semibold text-surface-900 dark:text-white">{user?.name}</h2>
                <p className="text-surface-500 dark:text-surface-400 mt-1">{user?.email}</p>
                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user?.role === 'venue_owner' ? 'bg-brand-100 text-brand-700' :
                  'bg-surface-100 text-surface-700'
                }`}>
                  {user?.role?.replace('_', ' ')} 
                </span>
              </div>

              <nav className="space-y-1" role="navigation" aria-label="Profile sections">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={classNames(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                      activeTab === tab.id
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 font-medium'
                        : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white'
                    )}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-700">
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleLogout}
                  leftIcon={<FiLogOut className="w-4 h-4" />}
                >
                  Sign Out
                </Button>
              </div>
            </Card>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.5, delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {activeTab === 'profile' && (
              <Card variant="elevated" padding="lg">
                <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-brand-600" />
                  Personal Information
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="border-t border-surface-100 dark:border-surface-700 pt-6">
                    <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                      <FiMapPin className="w-5 h-5 text-brand-600" />
                      Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input
                        label="Street Address"
                        value={profileData.address.street}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                      />
                      <Input
                        label="City"
                        value={profileData.address.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                      />
                      <Input
                        label="State"
                        value={profileData.address.state}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                      />
                      <Input
                        label="ZIP Code"
                        value={profileData.address.zipCode}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-surface-100 dark:border-surface-700">
                    <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                    <FiHeart className="w-5 h-5 text-brand-600" />
                    My Bookings
                  </h2>
                </div>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 p-6">
                        <div className="h-6 w-1/4 skeleton-title mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-4 w-full skeleton-text" />
                          <div className="h-4 w-full skeleton-text" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <Card variant="outlined" padding="xl" className="text-center">
                    <FiCalendar className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No bookings yet</h3>
                    <p className="text-surface-500 dark:text-surface-400 mb-6">Start exploring venues to book your first event!</p>
                    <Button variant="primary" asChild>
                      <a href="/venues">Browse Venues</a>
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 p-4 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                            <img src={(booking.venue as any)?.images?.[0] || '/placeholder-venue.jpg'} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-surface-900 dark:text-white truncate">{(booking.venue as any)?.name || 'Venue'}</h4>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 truncate">{booking.eventDetails.eventName}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-surface-500 dark:text-surface-400">
                              <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{new Date(booking.dates.startDate).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{booking.dates.startTime} - {booking.dates.endTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                    <FiHeart className="w-5 h-5 text-brand-600" />
                    Favorite Venues
                  </h2>
                </div>
                {favoriteVenues.length === 0 ? (
                  <Card variant="outlined" padding="xl" className="text-center">
                    <FiHeart className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No favorites yet</h3>
                    <p className="text-surface-500 dark:text-surface-400 mb-6">Save venues you love to find them easily later</p>
                    <Button variant="primary" asChild>
                      <a href="/venues">Explore Venues</a>
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteVenues.map((venue) => (
                      <div key={venue._id}>
                        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 overflow-hidden hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all">
                          <img src={venue.images[0] || '/placeholder-venue.jpg'} alt={venue.name} className="w-full h-40 object-cover" />
                          <div className="p-4">
                            <h4 className="font-semibold text-surface-900 dark:text-white truncate">{venue.name}</h4>
                            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{venue.location.city}, {venue.location.state}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-semibold text-brand-600">{venue.pricing.basePrice}/{venue.pricing.priceType}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <Card variant="elevated" padding="lg">
                <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-brand-600" />
                  Security Settings
                </h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    autoComplete="current-password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    autoComplete="new-password"
                    helperText="Must be at least 6 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    autoComplete="new-password"
                  />
                  <div className="pt-4 border-t border-surface-100 dark:border-surface-700">
                    <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
                      Update Password
                    </Button>
                  </div>
                </form>

                <div className="mt-12 pt-8 border-t border-surface-100 dark:border-surface-700">
                  <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">Active Sessions</h3>
                  <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-brand-600" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">Current Session</p>
                          <p className="text-sm text-surface-500 dark:text-surface-400">This device</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card variant="elevated" padding="lg">
                <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiBell className="w-5 h-5 text-brand-600" />
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    { id: 'booking_updates', label: 'Booking Updates', description: 'Confirmations, cancellations, and changes' },
                    { id: 'messages', label: 'Messages', description: 'New messages from hosts and guests' },
                    { id: 'reviews', label: 'Reviews', description: 'Reminders to review completed events' },
                    { id: 'promotions', label: 'Promotions', description: 'Special offers and discounts' },
                    { id: 'newsletter', label: 'Newsletter', description: 'Monthly updates and tips' },
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{notification.label}</p>
                        <p className="text-sm text-surface-500 dark:text-surface-400">{notification.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-surface-200 dark:bg-surface-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;