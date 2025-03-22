import Image from 'next/image';
import Link from 'next/link';
import { VERCEL_CONSOLE } from '@/constants/links';

export default function VercelPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Vercel</h1>
        <p className='text-muted-foreground max-w-3xl'>
          EmojiMap uses Vercel for many things. Each PR is auto deployed via
          Vercel to its own unique preview route. The production site is also
          deployed via Vercel.
        </p>
      </div>

      {/* Content */}
      <div className='flex items-center justify-center my-12'>
        <div className='bg-card border rounded-lg shadow-sm p-8 max-w-md w-full'>
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <Image
                src='https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png'
                alt='Vercel Logo'
                width={120}
                height={120}
                className='dark:invert'
              />
            </div>

            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-semibold'>Vercel Management</h2>
              <p className='text-muted-foreground'>
                Access Vercel console or request additional permissions
              </p>
            </div>

            <div className='flex flex-col gap-3 pt-2'>
              <Link
                href={VERCEL_CONSOLE}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex h-10 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full'
              >
                Go to Console
              </Link>
              <button className='inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full'>
                Request Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
