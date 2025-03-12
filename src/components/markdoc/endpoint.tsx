'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface EndpointProps {
  method: HttpMethod;
  path: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Endpoint component for displaying API endpoint information
 *
 * @param {EndpointProps} props - Component props
 * @param {HttpMethod} props.method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {string} props.path - API endpoint path
 * @param {string} [props.description] - Optional description of the endpoint
 * @param {React.ReactNode} props.children - Content with additional endpoint details
 * @returns {JSX.Element} Endpoint component
 */
export function Endpoint({
  method,
  path,
  description,
  children,
}: EndpointProps) {
  const methodColors: Record<HttpMethod, string> = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    PATCH:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };

  return (
    <div className='my-8 border border-border rounded-md overflow-hidden'>
      <div className='bg-muted p-4 border-b border-border'>
        <div className='flex items-center gap-3'>
          <span
            className={cn(
              'px-2 py-1 rounded text-xs font-mono font-bold',
              methodColors[method]
            )}
          >
            {method}
          </span>
          <span className='font-mono text-sm'>{path}</span>
        </div>
        {description && (
          <p className='mt-2 text-sm text-muted-foreground'>{description}</p>
        )}
      </div>
      {children && <div className='p-4'>{children}</div>}
    </div>
  );
}
