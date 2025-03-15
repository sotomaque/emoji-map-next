'use client';

import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalloutType = 'note' | 'warning' | 'error' | 'success' | 'info';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children?: ReactNode;
}

/**
 * Callout component for highlighting important information in documentation
 *
 * @param {CalloutProps} props - Component props
 * @param {CalloutType} [props.type='note'] - Type of callout (note, warning, error, success, info)
 * @param {string} [props.title] - Optional title for the callout
 * @param {React.ReactNode} props.children - Content of the callout
 * @returns {JSX.Element} Callout component
 */
export function Callout({ type = 'note', title, children }: CalloutProps) {
  const icons: Record<CalloutType, React.ReactNode> = {
    note: <Info className='h-5 w-5' />,
    warning: <AlertTriangle className='h-5 w-5' />,
    error: <AlertCircle className='h-5 w-5' />,
    success: <CheckCircle className='h-5 w-5' />,
    info: <Info className='h-5 w-5' />,
  };

  const styles: Record<CalloutType, string> = {
    note: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300',
    warning:
      'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300',
    error:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-900 dark:text-red-300',
    success:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-300',
    info: 'bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950 dark:border-cyan-900 dark:text-cyan-300',
  };

  const iconStyles: Record<CalloutType, string> = {
    note: 'text-blue-500 dark:text-blue-400',
    warning: 'text-amber-500 dark:text-amber-400',
    error: 'text-red-500 dark:text-red-400',
    success: 'text-green-500 dark:text-green-400',
    info: 'text-cyan-500 dark:text-cyan-400',
  };

  return (
    <div className={cn('p-4 border-l-4 rounded-r-md my-6', styles[type])}>
      <div className='flex items-start'>
        <div className={cn('mr-3 mt-1', iconStyles[type])}>{icons[type]}</div>
        <div>
          {title && <h5 className='font-semibold mb-1'>{title}</h5>}
          <div className='text-sm'>{children}</div>
        </div>
      </div>
    </div>
  );
}
