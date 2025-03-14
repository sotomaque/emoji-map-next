'use client';

import React from 'react';

interface ParameterProps {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Parameter component for displaying API parameter information
 *
 * @param {ParameterProps} props - Component props
 * @param {string} props.name - Parameter name
 * @param {string} props.type - Parameter type
 * @param {boolean} [props.required=false] - Whether the parameter is required
 * @param {string} [props.description] - Optional description of the parameter
 * @param {React.ReactNode} props.children - Additional content about the parameter
 * @returns {JSX.Element} Parameter component
 */
export function Parameter({
  name,
  type,
  required = false,
  description,
  children,
}: ParameterProps) {
  return (
    <div className='mb-4 last:mb-0'>
      <div className='flex items-start'>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <code className='font-mono text-sm font-semibold'>{name}</code>
            <span className='text-xs font-mono bg-muted px-1.5 py-0.5 rounded'>
              {type}
            </span>
            {required && (
              <span className='text-xs font-medium text-red-500 dark:text-red-400'>
                Required
              </span>
            )}
          </div>
          {description && (
            <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className='mt-2 pl-4 border-l border-border text-sm'>
          {children}
        </div>
      )}
    </div>
  );
}
