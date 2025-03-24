import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SUPABASE_CONSOLE } from '@/constants/links';

export default function SupabasePage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Supabase</h1>
        <p className='text-muted-foreground max-w-3xl'>
          EmojiMap uses Supabase as its primary database and backend service. It
          provides PostgreSQL database that is used to store all the data for
          the app.
        </p>
      </div>

      {/* Content */}
      <div className='flex items-center justify-center my-12'>
        <div className='bg-card border rounded-lg shadow-sm p-8 max-w-md w-full'>
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <Image
                src='/services/supabase.png'
                alt='Supabase Logo'
                width={120}
                height={120}
              />
            </div>

            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-semibold'>Supabase Management</h2>
              <p className='text-muted-foreground'>
                Access Supabase dashboard or request additional permissions
              </p>
            </div>

            <div className='flex flex-col gap-3 pt-2'>
              <Link
                href={SUPABASE_CONSOLE}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button asChild className='w-full'>
                  Go to Dashboard
                </Button>
              </Link>
              <Button variant='outline' className='w-full'>
                Request Access
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
