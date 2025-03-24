import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_STORE_CONNECT_CONSOLE } from '@/constants/links';

export default function AppStoreConnectPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>App Store Connect</h1>
        <p className='text-muted-foreground max-w-3xl'>
          EmojiMap uses App Store Connect for iOS app distribution. It provides
          tools for submitting and managing apps on the App Store.
        </p>
      </div>

      {/* Content */}
      <div className='flex items-center justify-center my-12'>
        <div className='bg-card border rounded-lg shadow-sm p-8 max-w-md w-full'>
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <Image
                src='/services/app-store-connect.png'
                alt='App Store Connect Logo'
                width={120}
                height={120}
              />
            </div>

            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-semibold'>
                App Store Connect Management
              </h2>
              <p className='text-muted-foreground'>
                Access App Store Connect or request additional permissions
              </p>
            </div>

            <div className='flex flex-col gap-3 pt-2'>
              <Link
                href={APP_STORE_CONNECT_CONSOLE}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button className='w-full'>Go to Console</Button>
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
