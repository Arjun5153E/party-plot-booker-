import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiMapPin, FiPhone, FiHeart, FiZap } from 'react-icons/fi';
import { useReducedMotion } from '../../hooks/useAnimations';

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Safety', href: '/safety' },
    { label: 'Cancellation Policy', href: '/cancellation-policy' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
  host: [
    { label: 'List Your Venue', href: '/host' },
    { label: 'Host Resources', href: '/host/resources' },
    { label: 'Community', href: '/host/community' },
    { label: 'Responsible Hosting', href: '/host/responsible' },
  ],
};

const socialLinks = [
  { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export const Footer: React.FC = () => {
  const reducedMotion = useReducedMotion();

  return (
    <footer className="bg-surface-950 text-surface-300" role="contentinfo">
      <div className="container-main py-16 lg:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white mb-4" aria-label="PartyPlot Booker Home">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center">
                <FiZap className="w-6 h-6" />
              </div>
              <span className="font-heading">PartyPlot</span>
            </Link>
            <p className="text-surface-400 mb-6 max-w-xs leading-relaxed">
              Discover and book the perfect party venue for any occasion. From intimate gatherings to grand celebrations, we connect you with exceptional spaces.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reducedMotion ? 0 : 0.2 + index * 0.05, duration: 0.3 }}
                  className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-surface-400 hover:text-white hover:bg-brand-500/20 hover:border-brand-500/30 border border-surface-700 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.nav
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.15 + categoryIndex * 0.05, duration: 0.4 }}
              aria-label={`${category.charAt(0).toUpperCase() + category.slice(1)} links`}
            >
              <h3 className="font-semibold text-white mb-4">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <ul className="space-y-3" role="list">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reducedMotion ? 0 : 0.2 + categoryIndex * 0.05 + linkIndex * 0.03, duration: 0.3 }}
                  >
                    <Link
                      to={link.href}
                      className="text-surface-400 hover:text-white hover:text-brand-400 transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reducedMotion ? 0 : 0.5, duration: 0.5 }}
          className="mt-16 pt-8 border-t border-surface-800 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-surface-500">
            <p>&copy; {new Date().getFullYear()} PartyPlot Booker. All rights reserved.</p>
            <div className="flex items-center gap-4 text-surface-500">
              <span className="flex items-center gap-1">
                <FiHeart className="w-4 h-4 text-red-500" aria-hidden="true" />
                Made with care
              </span>
              <span className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4" aria-hidden="true" />
                Available worldwide
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-surface-500">
            <div className="flex items-center gap-1">
              <FiPhone className="w-4 h-4" aria-hidden="true" />
              <a href="tel:+1-800-PARTYPLOT" className="hover:text-white hover:text-brand-400 transition-colors">1-800-PARTYPLOT</a>
            </div>
            <div className="flex items-center gap-1">
              <FiMail className="w-4 h-4" aria-hidden="true" />
              <a href="mailto:hello@partyplotbooker.com" className="hover:text-white hover:text-brand-400 transition-colors">hello@partyplotbooker.com</a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};