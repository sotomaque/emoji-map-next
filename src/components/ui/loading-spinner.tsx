'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
};

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

export function FullScreenLoader() {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'>
      <div className='text-center'>
        <LoadingSpinner size='lg' />
        <h2 className='mt-4 text-xl font-semibold'>Loading</h2>
        <p className='mt-2 text-muted-foreground'>
          Preparing your emoji map experience...
        </p>
      </div>
    </div>
  );
}

export function MapLoader() {
  return (
    <div className='absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10'>
      <div className='text-center'>
        <div className='text-6xl mb-4 animate-bounce'>🗺️</div>
        <LoadingSpinner size='md' />
        <h2 className='mt-4 text-xl font-semibold'>Loading Map</h2>
        <p className='mt-2 text-muted-foreground'>
          Finding the best places for you...
        </p>
      </div>
    </div>
  );
}

export function EmojiSelectorLoader() {
  return (
    <div className='h-16 w-full bg-background/80 backdrop-blur-sm flex items-center justify-center'>
      <div className='flex items-center space-x-4'>
        <LoadingSpinner size='sm' />
        <div className='space-y-2'>
          <div className='h-2 bg-muted rounded w-24'></div>
          <div className='h-2 bg-muted rounded w-16'></div>
        </div>
      </div>
    </div>
  );
}
