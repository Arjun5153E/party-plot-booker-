import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiHeart, FiLogOut, FiSettings, FiMail, FiStar } from 'react-icons/fi';
import { useReducedMotion } from '../../hooks/useAnimations';
import { getInitials } from '../../utils/helpers';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  onClick?: () => void;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, icon, badge, onClick, className = '' }) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  const reducedMotion = useReducedMotion();

  return (
    <Link
      to={href}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400'
          : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
      } ${className}`}
      style={{ transitionDuration: reducedMotion ? '0.01s' : '200ms' }}
    >
      {icon && <span className="w-5 h-5 flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center"
        >
          {badge > 99 ? '99+' : badge}
        </motion.span>
      )}
    </Link>
  );
};

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const userName =
    typeof user?.name === 'string'
      ? user.name
      : typeof user?.name === 'object' && user?.name
      ? (user.name as any).first || 'User'
      : 'User';
  const userEmail = typeof user?.email === 'string' ? user.email : '';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: '/', label: 'Discover' },
    { href: '/venues', label: 'All Venues' },
    { href: '/venues/map', label: 'Map View' },
    ...(isAuthenticated
      ? [
          { href: '/bookings', label: 'My Bookings', icon: <FiHeart className="w-5 h-5" /> },
          ...(user?.role === 'venue_owner' || user?.role === 'admin'
            ? [{ href: '/dashboard', label: 'Dashboard', icon: <FiSettings className="w-5 h-5" /> }]
            : []),
        ]
      : [
          { href: '/login', label: 'Sign In' },
          { href: '/register', label: 'Get Started', primary: true },
        ]),
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl shadow-sm border-b border-surface-200 dark:border-surface-800'
          : 'bg-transparent'
      }`}
      style={{ transitionDuration: reducedMotion ? '0.01s' : '300ms' }}
    >
      <nav className="container-main" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-surface-950 dark:text-white font-heading" aria-label="PartyPlot Booker Home">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center"
            >
              <FiStar className="w-6 h-6 text-white" />
            </motion.div>
            <span className="font-heading hidden sm:block">PartyPlot</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : index * 0.05, duration: 0.3 }}
              >
                <Link
                  to={link.href}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    location.pathname === link.href
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400'
                      : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                  } ${link.primary ? 'bg-brand-600 text-white hover:bg-brand-700' : ''}`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Action buttons + Theme Toggle + User Profile */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <AnimatePresence>
              {isAuthenticated && user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
                >
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                      aria-expanded={isProfileOpen}
                      aria-haspopup="true"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white font-semibold overflow-hidden"
                      >
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          getInitials(userName)
                        )}
                      </motion.div>
                      <span className="hidden sm:block font-medium text-surface-700 dark:text-surface-200">{userName}</span>
                      <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: reducedMotion ? 0.01 : 0.15 }}
                          className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-800 rounded-xl shadow-elegant-lg border border-surface-200 dark:border-surface-700 py-2 ring-1 ring-surface-200 dark:ring-surface-700 z-50"
                          role="menu"
                        >
                          <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                            <p className="font-medium text-surface-900 dark:text-white truncate">{userName}</p>
                            <p className="text-sm text-surface-500 dark:text-surface-400 truncate">{userEmail}</p>
                          </div>

                          <div className="p-1 space-y-1">
                            <NavLink
                              href="/bookings"
                              label="My Bookings"
                              icon={<FiHeart className="w-4 h-4" />}
                              onClick={() => setIsProfileOpen(false)}
                            />
                            {(user.role === 'venue_owner' || user.role === 'admin') && (
                              <NavLink
                                href="/dashboard"
                                label="Dashboard"
                                icon={<FiSettings className="w-4 h-4" />}
                                onClick={() => setIsProfileOpen(false)}
                              />
                            )}
                            <NavLink
                              href="/profile"
                              label="Profile Settings"
                              icon={<FiMail className="w-4 h-4" />}
                              onClick={() => setIsProfileOpen(false)}
                            />
                          </div>

                          <div className="border-t border-surface-100 dark:border-surface-700 pt-2 px-1">
                            <button
                              onClick={() => {
                                logout();
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-medium text-sm"
                              role="menuitem"
                            >
                              <FiLogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white">
                  Sign In
                </Link>
                <Link to="/register" className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="lg:hidden overflow-hidden bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                      location.pathname === link.href
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400'
                        : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                    } ${link.primary ? 'bg-brand-600 text-white' : ''}`}
                  >
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated && user && (
                  <div className="pt-4 border-t border-surface-100 dark:border-surface-800">
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white font-semibold">
                        {getInitials(userName)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-surface-900 dark:text-white truncate">{userName}</p>
                        <p className="text-sm text-surface-500 dark:text-surface-400 truncate">{userEmail}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors font-medium"
                    >
                      <FiLogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Navbar;