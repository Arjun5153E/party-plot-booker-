import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useAnimations';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', hover = true, className = '', children, ...props }, ref) => {
    const reducedMotion = useReducedMotion();

    const variantStyles = {
      default: 'card',
      elevated: 'card-elevated',
      outlined: 'bg-white border-2 border-surface-200',
      glass: 'card-glass',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hover && !reducedMotion ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : undefined}
        transition={{ duration: reducedMotion ? 0.01 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`rounded-2xl overflow-hidden ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        style={{ transitionDuration: reducedMotion ? '0.01s' : '300ms' }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, className = '', children, ...props }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...props}>
    <div>
      <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
      {subtitle && <p className="text-sm text-surface-500 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
    {children}
  </div>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children, ...props }) => (
  <div className={`flex items-center gap-3 pt-4 border-t border-surface-100 ${className}`} {...props}>
    {children}
  </div>
);

export const CardImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  height?: string;
}> = ({ src, alt, className = '', height = 'h-56' }) => (
  <div className={`relative overflow-hidden ${height} ${className}`}>
    <motion.img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

export const CardBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'surface';
}> = ({ children, className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'badge-surface',
    brand: 'badge-brand',
    accent: 'badge-accent',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    surface: 'badge-surface',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.span>
  );
};