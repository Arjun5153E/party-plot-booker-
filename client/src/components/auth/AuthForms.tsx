import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useReducedMotion } from '../../hooks/useAnimations';
import { Button, Input } from '../ui';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSwitchToForgot }) => {
  const reducedMotion = useReducedMotion();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      if (message.includes('email')) setErrors({ email: message });
      else if (message.includes('password')) setErrors({ password: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label htmlFor="email" className="label">Email Address</label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          leftIcon={<FiMail className="w-5 h-5" />}
          autoComplete="email"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="label mb-0">Password</label>
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          error={errors.password}
          leftIcon={<FiLock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          }
          autoComplete="current-password"
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        isLoading={isSubmitting}
        rightIcon={<FiArrowRight className="w-4 h-4" />}
      >
        Sign In
      </Button>

      <AnimatePresence mode="popLayout">
        {errors.general && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2"
            role="alert"
          >
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            {errors.general}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => toast('Google login coming soon!')}
          disabled={isSubmitting}
          leftIcon={<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => toast('Apple login coming soon!')}
          disabled={isSubmitting}
          leftIcon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.65A10.47 10.47 0 0012 22c-5.52 0-10-4.48-10-10S6.48 2 12 2c3.78 0 6.84 2.14 8.5 5.17l-2.75 2.72A7.2 7.2 0 0112 4.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5c2.57 0 4.7-1.27 5.97-3.14l-2.04-2.04A5.03 5.03 0 0112 17.5c-2.76 0-5-2.24-5-5s2.24-5 5-5c1.53 0 2.77.7 3.57 1.79l2.26-2.24C16.24 5.07 14.14 4 12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9c2.44 0 4.48-.91 6.05-2.35z"/></svg>}
        >
          Apple
        </Button>
      </div>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Sign up
        </button>
      </p>
    </motion.form>
  );
};

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const reducedMotion = useReducedMotion();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.phone && !/^[\d\s\-+]{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(formData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      if (message.includes('email')) setErrors({ email: message });
      else if (message.includes('password')) setErrors({ password: message });
      else setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label htmlFor="name" className="label">Full Name</label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          leftIcon={<FiUser className="w-5 h-5" />}
          autoComplete="name"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="email" className="label">Email Address</label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          leftIcon={<FiMail className="w-5 h-5" />}
          autoComplete="email"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="phone" className="label">Phone Number (Optional)</label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          error={errors.phone}
          leftIcon={<FiPhone className="w-5 h-5" />}
          autoComplete="tel"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="password" className="label">Password</label>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          error={errors.password}
          leftIcon={<FiLock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          }
          autoComplete="new-password"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="label">Confirm Password</label>
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          error={errors.confirmPassword}
          leftIcon={<FiLock className="w-5 h-5" />}
          autoComplete="new-password"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="role" className="label">I want to</label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          className="input appearance-none pr-10"
          disabled={isSubmitting}
        >
          <option value="user">Book venues as a guest</option>
          <option value="venue_owner">List my venue for bookings</option>
        </select>
      </div>

      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
        <input
          type="checkbox"
          id="terms"
          required
          className="w-4 h-4 mt-0.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I agree to the <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>, 
          <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>, and
          <a href="/cancellation-policy" className="text-primary-600 hover:underline">Cancellation Policy</a>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        isLoading={isSubmitting}
        rightIcon={<FiArrowRight className="w-4 h-4" />}
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Sign in
        </button>
      </p>
    </motion.form>
  );
};

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const reducedMotion = useReducedMotion();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
        >
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
        <p className="text-gray-500 mb-6">
          We've sent password reset instructions to <strong>{email}</strong>
        </p>
        <Button variant="secondary" onClick={onSwitchToLogin}>
          Back to Sign In
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset Password</h3>
        <p className="text-gray-500">Enter your email and we'll send you reset instructions</p>
      </div>

      <div>
        <label htmlFor="email" className="label">Email Address</label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          leftIcon={<FiMail className="w-5 h-5" />}
          autoComplete="email"
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        isLoading={isSubmitting}
        rightIcon={<FiArrowRight className="w-4 h-4" />}
      >
        Send Reset Link
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          Back to Sign In
        </button>
      </div>
    </motion.form>
  );
};