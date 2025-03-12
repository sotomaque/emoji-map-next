import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emoji Map | Docs',
  description: 'Learn about Emoji Map - Smooth Brain? Smooth Map.',
};

export default function ApiDocsPage() {
  return (
    <div className='container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]'>
      <h1 className='text-3xl font-bold mb-6'>API Documentation</h1>
      <div className='bg-muted p-8 rounded-lg shadow-sm max-w-2xl text-center'>
        <h2 className='text-xl font-semibold mb-4'>Coming Soon</h2>
        <p className='mb-4'>
          We&apos;re currently working on comprehensive API documentation for
          the Emoji Map platform.
        </p>
        <p className='mb-6'>
          Check back soon for detailed information on available endpoints,
          request formats, and response structures.
        </p>
        <div className='flex justify-center'>
          <Link
            href='/'
            className='bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors'
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
