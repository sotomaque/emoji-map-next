import Image from 'next/image';
import Link from 'next/link';
import { POSTMAN_COLLECTION } from '@/constants/links';

export default function PostmanPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Postman</h1>
        <p className='text-muted-foreground max-w-3xl'>
          EmojiMap uses Postman for API testing.
        </p>
      </div>

      {/* Content */}
      <div className='flex items-center justify-center my-12'>
        <div className='bg-card border rounded-lg shadow-sm p-8 max-w-md w-full'>
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <Image
                src='/services/postman.png'
                alt='Postman Logo'
                width={120}
                height={120}
                className='dark:invert'
              />
            </div>

            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-semibold'>Postman</h2>
              <p className='text-muted-foreground'>
                Access Postman or request additional permissions
              </p>
            </div>

            <div className='flex flex-col gap-3 pt-2'>
              <Link
                href={POSTMAN_COLLECTION}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex h-10 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full'
              >
                View Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
