import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useAnimations';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const reducedMotion = useReducedMotion();

    const baseStyles = `
      inline-flex items-center justify-center gap-2.5 font-semibold rounded-xl
      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `;

    const variantStyles = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      accent: 'btn-accent',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
      outline: 'btn-outline',
    };

    const sizeStyles = {
      sm: 'px-4 py-2.5 text-sm',
      md: 'px-6 py-3.5 text-sm',
      lg: 'px-7 py-4 text-base',
      xl: 'px-8 py-4.5 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading && !reducedMotion ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !isLoading && !reducedMotion ? { scale: 0.98 } : undefined}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        style={{ transitionDuration: reducedMotion ? '0.01s' : '200ms' }}
        {...props}
      >
        {isLoading ? (
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.3"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            />
            <motion.path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              animate={{ strokeDashoffset: [0, -31.4] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.svg>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';