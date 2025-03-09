'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children?: React.ReactNode;
}

/**
 * A shimmer loading effect component
 */
export function Shimmer({
  className,
  width,
  height,
  rounded = 'md',
  children,
  ...props
}: ShimmerProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        roundedClasses[rounded],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * A shimmer container for multiple shimmer elements
 */
export function ShimmerContainer({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse', className)}
      {...props}
    >
      {children}
    </div>
  );
} 