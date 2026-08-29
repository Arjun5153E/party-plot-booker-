import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiMapPin, FiArrowLeft, FiCompass } from 'react-icons/fi';
import { useReducedMotion } from '../hooks/useAnimations';
import { Button } from '../components/ui';

export const NotFoundPage: React.FC = () => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center mx-auto mb-8"
        >
          <FiCompass className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold text-surface-900 dark:text-white font-heading mb-4"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-semibold text-surface-900 dark:text-white mb-4"
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-surface-500 dark:text-surface-400 mb-8 leading-relaxed"
        >
          Oops! The page you're looking for doesn't exist or has been moved. 
          Don't worry, let's get you back on track.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" asChild rightIcon={<FiArrowLeft className="w-4 h-4" />}>
            <Link to="/">Back to Home</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild leftIcon={<FiSearch className="w-4 h-4" />}>
            <Link to="/venues">Browse Venues</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-3 gap-4 text-center"
        >
          <Link to="/" className="p-4 rounded-xl bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 hover:border-brand-300 hover:shadow-md transition-all">
            <FiHome className="w-6 h-6 text-brand-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-surface-900 dark:text-white">Home</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Start fresh</p>
          </Link>
          <Link to="/venues" className="p-4 rounded-xl bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 hover:border-brand-300 hover:shadow-md transition-all">
            <FiSearch className="w-6 h-6 text-accent-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-surface-900 dark:text-white">Explore</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Find venues</p>
          </Link>
          <Link to="/venues/map" className="p-4 rounded-xl bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 hover:border-brand-300 hover:shadow-md transition-all">
            <FiMapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-surface-900 dark:text-white">Map View</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Browse visually</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-sm text-surface-400 dark:text-surface-500"
        >
          <p>Still can't find what you're looking for?</p>
          <Link to="/contact" className="text-brand-600 hover:underline ml-1">Contact Support</Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
