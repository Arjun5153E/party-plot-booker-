import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle, FiUser } from 'react-icons/fi';
import { useReducedMotion } from '../hooks/useAnimations';
import { RegisterForm } from '../components/auth';
import { Card } from '../components/ui';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleRegisterSuccess = () => {
    toast.success('Account created successfully!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-surface-900 dark:text-white mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-display">PartyPlot</span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Create your account</h1>
          <p className="text-surface-500 dark:text-surface-400">Join thousands of event planners and venue owners</p>
        </div>

        <Card variant="elevated" padding="xl">
          <RegisterForm
            onSwitchToLogin={() => navigate('/login')}
            onSuccess={handleRegisterSuccess}
          />
        </Card>

        <div className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
          <p>By continuing, you agree to our </p>
          <Link to="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
          <span className="mx-2">and</span>
          <Link to="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { icon: FiShield, label: 'Secure', desc: 'Encrypted payments' },
            { icon: FiCheckCircle, label: 'Verified', desc: 'Trusted venues' },
            { icon: FiUser, label: 'Support', desc: '24/7 help center' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700"
            >
              <item.icon className="w-6 h-6 text-brand-600 mx-auto mb-2" />
              <p className="font-medium text-surface-900 dark:text-white text-sm">{item.label}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;