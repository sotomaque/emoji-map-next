'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponseProps {
  status: number;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Response component for displaying API response information
 *
 * @param {ResponseProps} props - Component props
 * @param {number} props.status - HTTP status code
 * @param {string} [props.description] - Optional description of the response
 * @param {React.ReactNode} props.children - Content with response details
 * @returns {JSX.Element} Response component
 */
export function Response({ status, description, children }: ResponseProps) {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    } else if (status >= 300 && status < 400) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    } else if (status >= 400 && status < 500) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    } else if (status >= 500) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <div className='mb-6 last:mb-0'>
      <div className='flex items-center gap-3 mb-2'>
        <span
          className={cn(
            'px-2 py-1 rounded text-xs font-mono font-bold',
            getStatusColor(status)
          )}
        >
          {status}
        </span>
        {description && <span className='text-sm'>{description}</span>}
      </div>
      {children && (
        <div className='pl-4 border-l border-border'>{children}</div>
      )}
    </div>
  );
}
