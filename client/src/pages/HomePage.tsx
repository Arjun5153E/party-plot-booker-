import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiCalendar, FiUsers, FiStar, FiHeart, FiShield, FiCheckCircle, FiArrowRight, FiZap, FiGlobe, FiAward, FiTrendingUp } from 'react-icons/fi';
import { useReducedMotion } from '../hooks/useAnimations';
import { VenueCard, VenueCardSkeleton } from '../components/venue';
import { Button } from '../components/ui';
import { useVenues } from '../context/VenueContext';
import { useLocationContext } from '../context/LocationContext';
import { useGeolocation } from '../hooks/useGeolocation';
import toast from 'react-hot-toast';

const features = [
  {
    icon: FiSearch,
    title: 'Smart Discovery',
    description: 'AI-powered venue matching finds your perfect space in seconds, not hours.',
  },
  {
    icon: FiMapPin,
    title: 'Location Intelligence',
    description: 'Hyper-local search with real-time availability and proximity-based recommendations.',
  },
  {
    icon: FiCalendar,
    title: 'Live Availability',
    description: 'Real-time calendars with instant booking confirmation — no back-and-forth emails.',
  },
  {
    icon: FiUsers,
    title: 'Any Scale Events',
    description: 'From intimate gatherings of 20 to grand celebrations of 500+ guests.',
  },
  {
    icon: FiStar,
    title: 'Verified Reviews',
    description: 'Authentic reviews from real guests with detailed ratings, photos, and insights.',
  },
  {
    icon: FiShield,
    title: 'Booking Protection',
    description: 'Free cancellation options, secure payments, and 24/7 dedicated support.',
  },
];

const stats = [
  { value: '12,000+', label: 'Premium Venues', icon: FiAward },
  { value: '75,000+', label: 'Events Hosted', icon: FiTrendingUp },
  { value: '800+', label: 'Cities Covered', icon: FiGlobe },
  { value: '99.2%', label: 'Satisfaction Rate', icon: FiAward },
];

const trustedBy = [
  { name: 'EventPro', logo: 'EP' },
  { name: 'CelebrateCo', logo: 'CC' },
  { name: 'VenueMaster', logo: 'VM' },
  { name: 'PartyPlanners', logo: 'PP' },
  { name: 'EventHub', logo: 'EH' },
];

export const HomePage: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { fetchVenues, featuredVenues, isLoading } = useVenues();
  const { city } = useLocationContext();
  const { latitude, longitude, requestLocation } = useGeolocation({ autoRequest: false });

  useEffect(() => {
    // Fixed: fetch without the negative sign in sortBy
    fetchVenues({ limit: 6, sortBy: 'rating.average', sortOrder: 'desc' });
  }, [fetchVenues]);

  const handleLocationSearch = async () => {
    if (!latitude || !longitude) {
      requestLocation();
      return;
    }
    toast.success('Finding venues near you...');
  };

  return (
    <div className="bg-white dark:bg-surface-950 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-50 via-white to-emerald-50/30 dark:from-surface-950 dark:via-surface-900 dark:to-emerald-950/20" />
        <div className="absolute inset-0 bg-mesh opacity-50 dark:opacity-20" />
        <div className="absolute inset-0 bg-gradient-radial from-emerald-100/50 via-transparent to-transparent dark:from-emerald-900/20" />
        
        <div className="container-main relative py-28 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 text-sm font-medium mb-8 border border-brand-100 dark:border-brand-900"
            >
              <FiZap className="w-4 h-4" />
              New: AI-powered venue matching
            </motion.span>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-surface-950 dark:text-white leading-[1.1] mb-8 font-heading tracking-tight">
              Find & Book the Perfect{' '}
              <span className="text-gradient-brand">
                {city ? `Venues in ${city}` : 'Event Venue'}
              </span>
              {' '}Instantly
            </h1>
            
            <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              Discover stunning venues for weddings, corporate events, celebrations & more. 
              Real-time availability, verified reviews, and instant booking — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="xl" asChild rightIcon={<FiArrowRight className="w-5 h-5" />} className="gap-3">
                <Link to="/venues">Explore Venues</Link>
              </Button>
              <Button variant="outline" size="xl" asChild onClick={handleLocationSearch} leftIcon={<FiMapPin className="w-5 h-5" />} className="gap-3 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">
                <Link to="/venues">Find Near Me</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-surface-500 dark:text-surface-400">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-brand-500" />
                <span>Free cancellation on most venues</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-brand-500" />
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-brand-500" />
                <span>24/7 concierge support</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: reducedMotion ? 0.01 : 0.8 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reducedMotion ? 0 : 0.4 + index * 0.1, type: 'spring', stiffness: 200 }}
                className="text-center p-6 group rounded-2xl bg-white/60 dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800 backdrop-blur-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-surface-950 dark:text-white font-heading mb-2">{stat.value}</div>
                <div className="text-surface-500 dark:text-surface-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="py-16 border-y border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
        <div className="container-main">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Trusted by industry leaders</p>
            <div className="flex items-center gap-10 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-300">
              {trustedBy.map((brand) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-300 text-sm font-bold">
                    {brand.logo}
                  </div>
                  <span className="text-sm font-medium text-surface-600 dark:text-surface-300 hidden sm:block">{brand.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white dark:bg-surface-950 py-24">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 text-sm font-medium mb-6 border border-brand-100 dark:border-brand-900">
              <FiZap className="w-4 h-4" />
              Why Choose PartyPlot Booker
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-surface-950 dark:text-white mb-6 font-heading tracking-tight">
              Everything You Need for the Perfect Event
            </h2>
            <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
              We combine intelligent technology with human expertise to make venue discovery effortless.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: reducedMotion ? 0 : index * 0.1, duration: 0.5 }}
                className="group p-8 rounded-3xl bg-surface-50 dark:bg-surface-900 hover:bg-white dark:hover:bg-surface-850 hover:shadow-elegant-lg border border-surface-100 dark:border-surface-800 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-surface-950 dark:text-white mb-3 font-heading">{feature.title}</h3>
                <p className="text-surface-600 dark:text-surface-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Venues */}
      <section className="section bg-surface-50 dark:bg-surface-900/50 py-24">
        <div className="container-main">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-surface-950 dark:text-white mb-4 font-heading tracking-tight">
                Featured Venues This Week
              </h2>
              <p className="text-lg text-surface-600 dark:text-surface-400">
                Handpicked venues with exceptional ratings and instant availability
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reducedMotion ? 0.01 : 0.6, delay: 0.1 }}
            >
              <Link to="/venues">
                <Button variant="outline" rightIcon={<FiArrowRight className="w-4 h-4" />} className="gap-2 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">
                  View All Venues
                </Button>
              </Link>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <VenueCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredVenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredVenues.map((venue, index) => (
                <motion.div
                  key={venue._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reducedMotion ? 0 : index * 0.1, duration: 0.5 }}
                >
                  <VenueCard venue={venue} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-surface-500 dark:text-surface-400">No featured venues available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-white dark:bg-surface-950 py-24">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-surface-950 dark:text-white mb-6 font-heading tracking-tight">
              Book Your Venue in 3 Simple Steps
            </h2>
            <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
              From discovery to celebration — we make it effortless.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Discover', description: 'Browse 12,000+ curated venues with smart filters, AI recommendations, and real-time availability.', icon: FiSearch },
              { step: '02', title: 'Book', description: 'Instant booking with secure payments, free cancellation options, and instant confirmation.', icon: FiZap },
              { step: '03', title: 'Celebrate', description: 'Enjoy your event with 24/7 support, vendor coordination, and post-event memories.', icon: FiHeart },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: reducedMotion ? 0 : 0.2 + index * 0.1, duration: 0.5 }}
                className="relative group p-8 rounded-3xl bg-surface-50 dark:bg-surface-900 hover:bg-white dark:hover:bg-surface-850 hover:shadow-elegant-lg border border-surface-100 dark:border-surface-800 transition-all duration-500"
              >
                <div className="absolute top-6 right-6 text-surface-200 dark:text-surface-800 font-bold text-5xl font-heading opacity-50 group-hover:opacity-100 transition-opacity">
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-surface-950 dark:text-white mb-3 font-heading">{item.title}</h3>
                <p className="text-surface-600 dark:text-surface-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-brand-900" />
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute inset-0 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent" />
        
        <div className="container-main relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading tracking-tight">
              Ready to Plan Your Perfect Event?
            </h2>
            <p className="text-lg sm:text-xl text-surface-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 75,000+ event organizers who trust PartyPlot Booker for their most important celebrations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild rightIcon={<FiArrowRight className="w-5 h-5" />} className="gap-3 bg-white text-surface-900 hover:bg-surface-100 hover:text-surface-950">
                <Link to="/venues">Start Exploring</Link>
              </Button>
              <Button variant="ghost" size="xl" asChild className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 gap-2">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0.01 : 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { icon: FiShield, label: 'Secure Payments', desc: 'PCI DSS compliant' },
              { icon: FiCalendar, label: 'Instant Confirmation', desc: 'Real-time booking' },
              { icon: FiHeart, label: 'Free Cancellation', desc: 'Up to 48 hours before' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : 0.4 + index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-white mb-1">{item.label}</p>
                <p className="text-surface-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;