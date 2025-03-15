'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  language?: string;
  title?: string;
  children?: ReactNode;
}

/**
 * CodeBlock component for displaying code examples in documentation
 *
 * @param {CodeBlockProps} props - Component props
 * @param {string} [props.language='typescript'] - Programming language of the code
 * @param {string} [props.title] - Optional title for the code block
 * @param {React.ReactNode} props.children - Code content
 * @returns {JSX.Element} CodeBlock component
 */
export function CodeBlock({
  language = 'typescript',
  title,
  children,
}: CodeBlockProps) {
  return (
    <div className='my-6 overflow-hidden rounded-md border border-border'>
      {title && (
        <div className='bg-muted px-4 py-2 border-b border-border'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>{title}</span>
            <span className='text-xs text-muted-foreground'>{language}</span>
          </div>
        </div>
      )}
      <div className={cn('p-4 overflow-x-auto bg-muted/50 font-mono text-sm')}>
        {children}
      </div>
    </div>
  );
}
