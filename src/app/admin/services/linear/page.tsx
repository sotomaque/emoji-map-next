import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LINEAR_CONSOLE } from '@/constants/links';
import { cn } from '@/lib/utils';

export default function LinearPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Linear</h1>
        <p className='text-muted-foreground max-w-3xl'>
          EmojiMap uses Linear for project management.
        </p>
      </div>

      {/* Content */}
      <div className='flex items-center justify-center my-12'>
        <div className='bg-card border rounded-lg shadow-sm p-8 max-w-md w-full'>
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <Image
                src='/services/linear.png'
                alt='Linear Logo'
                width={120}
                height={120}
                className='dark:invert'
              />
            </div>

            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-semibold'>Linear</h2>
              <p className='text-muted-foreground'>
                Access Linear or request additional permissions
              </p>
            </div>

            <div className='flex flex-col gap-3 pt-2'>
              <Link
                href={LINEAR_CONSOLE}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button
                  className={cn(
                    'w-full bg-black text-white hover:bg-black/90',
                    'dark:bg-white dark:text-black dark:hover:bg-white/90'
                  )}
                >
                  Go to Console
                </Button>
              </Link>
              <Button variant="outline" className='w-full'>
                Request Access
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
