'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FavoritesTable from './components/favorites-table';
import PlaceDetails from './components/place-details';
import ProfileContent from './components/profile-content';
import { useUser } from '../context/user-context';

export default function ProfilePage() {
  const user = useUser();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const handleViewPlace = (placeId: string) => {
    setSelectedPlaceId(placeId);

    // Scroll to the place details section
    setTimeout(() => {
      document.getElementById('place-details-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Page header with title and back button */}
        <div className='flex flex-col sm:flex-row justify-between items-center mb-8 pb-5 border-b border-gray-200 dark:border-gray-700'>
          <h1 className='text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500'>
            Your Profile
          </h1>
          <Button
            asChild
            variant='outline'
            className='mt-4 sm:mt-0 bg-cyan-500 text-white hover:bg-cyan-600 border-none'
          >
            <Link href='/app'>Back to Dashboard</Link>
          </Button>
        </div>

        {/* Profile content section */}
        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8'>
          <ProfileContent user={user} />
        </div>

        {/* Favorites table section */}
        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8'>
          <FavoritesTable
            favorites={user.favorites}
            onViewPlace={handleViewPlace}
          />
        </div>

        {/* Place details section */}
        <div id='place-details-section' className='mb-8'>
          {selectedPlaceId ? (
            <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden'>
              <div className='px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-xl font-semibold text-white'>
                    Place Details
                  </h2>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setSelectedPlaceId(null)}
                    className='text-white hover:bg-white/10 hover:text-white'
                    aria-label='Close place details'
                  >
                    <X className='h-5 w-5' />
                  </Button>
                </div>
              </div>
              <PlaceDetails placeId={selectedPlaceId} />
            </div>
          ) : (
            <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center text-gray-500 dark:text-gray-400'>
              Select a place from your favorites to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
