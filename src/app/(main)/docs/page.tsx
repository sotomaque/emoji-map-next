import React from 'react';
import Link from 'next/link';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ArrowRight, Book, Map } from 'lucide-react';
import * as MarkdocComponents from '@/components/markdoc';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emoji Map | API Documentation',
  description: 'API documentation for Emoji Map - Smooth Brain? Smooth Map.',
};

/**
 * API Documentation page that renders Markdoc content
 *
 * @returns {JSX.Element} API Documentation page
 */
export default function ApiDocsPage() {
  // Read the Markdoc content from the file
  const content = readFileSync(
    join(process.cwd(), 'src/markdoc/api/index.md'),
    'utf-8'
  );

  return (
    <div className='bg-gradient-to-b from-background to-muted/20 min-h-screen'>
      <div className='container mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        {/* Header with visual elements */}
        <div className='mb-12 text-center'>
          <div className='inline-block p-3 bg-primary/10 rounded-full mb-4'>
            <Book className='h-8 w-8 text-primary' />
          </div>
          <h1 className='text-4xl font-bold tracking-tight mb-4'>
            API Documentation
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Everything you need to integrate with the Emoji Map API
          </p>
        </div>

        {/* Quick navigation cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
          <Link
            href='/docs/api/places/details'
            className='group flex flex-col p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='p-2 bg-primary/10 rounded-full'>
                <Map className='h-5 w-5 text-primary' />
              </div>
              <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Place Details API</h3>
            <p className='text-muted-foreground text-sm'>
              Get comprehensive information about a specific place
            </p>
          </Link>

          <Link
            href='/docs/api/places/photos'
            className='group flex flex-col p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='p-2 bg-primary/10 rounded-full'>
                <Map className='h-5 w-5 text-primary' />
              </div>
              <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Place Photos API</h3>
            <p className='text-muted-foreground text-sm'>
              Retrieve photos for a specific place
            </p>
          </Link>
        </div>

        {/* Main content with improved styling */}
        <div className='bg-card rounded-lg border border-border shadow-sm p-8'>
          <div className='prose prose-cyan dark:prose-invert max-w-none'>
            <MarkdocComponents.Markdoc content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
