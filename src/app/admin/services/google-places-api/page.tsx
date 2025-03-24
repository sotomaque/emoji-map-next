import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GOOGLE_PLACES_API_CONSOLE } from '@/constants/links';

export default function GooglePlacesApiPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Google Places API</h1>
        <p className='text-muted-foreground max-w-3xl'>
          EmojiMap uses Google Places API for location data and mapping
          services.
        </p>
      </div>

      {/* Content */}
      <div className='flex items-center justify-center my-12'>
        <div className='bg-card border rounded-lg shadow-sm p-8 max-w-md w-full'>
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <Image
                src='/services/google-places-api.svg'
                alt='Google Places API Logo'
                width={120}
                height={120}
              />
            </div>

            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-semibold'>
                Google Places API Management
              </h2>
              <p className='text-muted-foreground'>
                Access Google Cloud console or request additional permissions
              </p>
            </div>

            <div className='flex flex-col gap-3 pt-2'>
              <Link
                href={GOOGLE_PLACES_API_CONSOLE}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button className='w-full'>
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
