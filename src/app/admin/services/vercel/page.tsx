import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VERCEL_CONSOLE } from '@/constants/links';
import { cn } from '@/lib/utils';

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
                src='/services/vercel.png'
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
              >
                <Button
                  asChild
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
