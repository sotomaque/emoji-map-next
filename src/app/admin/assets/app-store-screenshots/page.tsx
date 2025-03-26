'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { APPLAUNCHPAD_CONSOLE } from '@/constants/links';

export default function AppStoreScreenshotsPage() {
  const screenshots = [
    {
      name: 'Screenshot 1',
      description: 'Main app interface',
      path: '/app-store-screenshots/image1.jpg',
    },
    {
      name: 'Screenshot 2',
      description: 'Feature showcase',
      path: '/app-store-screenshots/image2.jpg',
    },
    {
      name: 'Screenshot 3',
      description: 'User interaction',
      path: '/app-store-screenshots/image3.jpg',
    },
    {
      name: 'Screenshot 4',
      description: 'App functionality',
      path: '/app-store-screenshots/image4.jpg',
    },
    {
      name: 'Screenshot 5',
      description: 'Additional features',
      path: '/app-store-screenshots/image5.jpg',
    },
  ];

  return (
    <div className='container mx-auto max-w-7xl px-6 py-8'>
      <div className='flex flex-col gap-8'>
        {/* Header Section */}
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight'>
            App Store Screenshots
          </h1>
          <p className='text-lg text-muted-foreground'>
            Official App Store screenshots generated with App Launchpad
          </p>
        </div>

        {/* App Launchpad Info */}
        <Card className='p-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <h2 className='text-xl font-semibold'>
                Generated with App Launchpad
              </h2>
              <p className='text-sm text-muted-foreground'>
                These screenshots were professionally created using App
                Launchpad. Visit the console to generate new screenshots or make
                updates.
              </p>
            </div>
            <Button asChild variant='outline' className='shrink-0'>
              <Link
                href={APPLAUNCHPAD_CONSOLE}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2'
              >
                <span>Open App Launchpad</span>
                <ExternalLink className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Screenshots Grid */}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {screenshots.map((screenshot) => (
            <Card
              key={screenshot.name}
              className='flex flex-col overflow-hidden'
            >
              <div className='relative aspect-[9/16] w-full bg-gradient-to-br from-muted/50 to-muted'>
                <Image
                  src={screenshot.path}
                  alt={screenshot.name}
                  fill
                  className='object-cover'
                  sizes='(min-width: 1280px) 384px, (min-width: 1024px) 288px, (min-width: 768px) 50vw, 100vw'
                />
              </div>
              <div className='flex flex-1 flex-col gap-2 p-6'>
                <div className='space-y-1'>
                  <h3 className='font-semibold tracking-tight'>
                    {screenshot.name}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {screenshot.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Guidelines */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold tracking-tight'>
            Screenshot Guidelines
          </h2>
          <ul className='mt-4 space-y-2 text-sm text-muted-foreground'>
            <li>
              • Screenshots should be high resolution and optimized for
              different devices
            </li>
            <li>• Each screenshot should highlight a key feature or benefit</li>
            <li>• Text overlays should be clear and readable</li>
            <li>
              • Use App Launchpad to maintain consistent styling across all
              screenshots
            </li>
            <li>• Update screenshots when significant UI changes are made</li>
          </ul>
        </Card>

        {/* Quick Links */}
        <div className='flex flex-wrap gap-4'>
          <Button asChild variant='outline'>
            <Link href='/admin/services/app-launchpad'>
              App Launchpad Service Details
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href='/admin/app-store-trends'>View App Store Trends</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
