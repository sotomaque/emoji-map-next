'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
};

/**
 * A customizable loading spinner component
 *
 * @param {LoadingSpinnerProps} props - Component props
 * @param {string} [props.size='md'] - Size of the spinner (sm, md, lg)
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.text] - Optional text to display below the spinner
 * @returns {JSX.Element} Loading spinner component
 */
export function LoadingSpinner({
  size = 'md',
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <motion.div
        className={cn(
          'rounded-full border-t-transparent border-primary animate-spin',
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && <p className='mt-2 text-sm text-muted-foreground'>{text}</p>}
    </div>
  );
}
