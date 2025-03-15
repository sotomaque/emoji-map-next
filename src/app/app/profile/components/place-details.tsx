'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Detail } from '@/types/details';

interface PlaceDetailsProps {
  placeId: string | null;
}

// Function to fetch place details
const fetchPlaceDetails = async (placeId: string): Promise<Detail> => {
  const response = await fetch(`/api/places/details?id=${placeId}`);

  if (!response.ok) {
    throw new Error(`Error fetching place details: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};

export default function PlaceDetails({ placeId }: PlaceDetailsProps) {
  const {
    data: placeDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['placeDetails', placeId],
    queryFn: () => (placeId ? fetchPlaceDetails(placeId) : null),
    enabled: !!placeId, // Only run the query if placeId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on failure
  });

  if (!placeId) {
    return (
      <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
        Select a place to view details
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div
          className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500'
          role='status'
        >
          <span className='sr-only'>Loading...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='text-center py-8 text-red-500'>
        <p>
          Error:{' '}
          {error instanceof Error
            ? error.message
            : 'Failed to fetch place details'}
        </p>
        <Button
          variant='outline'
          className='mt-4 bg-cyan-500 text-white hover:bg-cyan-600 border-none'
          onClick={() => refetch()}
        >
          <RefreshCw className='mr-2 h-4 w-4' />
          Try Again
        </Button>
      </div>
    );
  }

  if (!placeDetails) {
    return (
      <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
        No details available for this place
      </div>
    );
  }

  // Helper function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className='text-yellow-400'>
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key='half' className='text-yellow-400'>
          ★
        </span>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className='text-gray-300 dark:text-gray-600'>
          ★
        </span>
      );
    }

    return stars;
  };

  // Helper function to render price level
  const renderPriceLevel = (priceLevel: number | null) => {
    if (priceLevel === null) return 'N/A';

    const symbols = '$$$$';
    return symbols.slice(0, priceLevel);
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
      <h3 className='text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500'>
        {placeDetails.displayName || placeDetails.name}
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <div className='mb-4'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Type
            </span>
            <p className='font-medium text-gray-900 dark:text-white'>
              {placeDetails.primaryTypeDisplayName}
            </p>
          </div>

          <div className='mb-4'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Rating
            </span>
            <div className='flex items-center'>
              <div className='flex mr-2 text-lg'>
                {renderStars(placeDetails.rating || 0)}
              </div>
              <span className='text-gray-700 dark:text-gray-300'>
                {placeDetails.rating} ({placeDetails.userRatingCount} reviews)
              </span>
            </div>
          </div>

          <div className='mb-4'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Price Level
            </span>
            <p className='font-medium text-gray-900 dark:text-white'>
              {renderPriceLevel(placeDetails.priceLevel)}
            </p>
          </div>

          {placeDetails.openNow !== undefined && (
            <div className='mb-4'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Status
              </span>
              <p
                className={`font-medium ${
                  placeDetails.openNow
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {placeDetails.openNow ? 'Open Now' : 'Closed'}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className='space-y-2'>
            {placeDetails.editorialSummary && (
              <div className='mb-4'>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Description
                </span>
                <p className='font-medium text-gray-900 dark:text-white'>
                  {placeDetails.editorialSummary}
                </p>
              </div>
            )}

            <div className='grid grid-cols-2 gap-2'>
              {placeDetails.takeout && (
                <div className='flex items-center'>
                  <span className='text-green-500 mr-2'>✓</span>
                  <span className='text-gray-700 dark:text-gray-300'>
                    Takeout
                  </span>
                </div>
              )}

              {placeDetails.delivery && (
                <div className='flex items-center'>
                  <span className='text-green-500 mr-2'>✓</span>
                  <span className='text-gray-700 dark:text-gray-300'>
                    Delivery
                  </span>
                </div>
              )}

              {placeDetails.dineIn && (
                <div className='flex items-center'>
                  <span className='text-green-500 mr-2'>✓</span>
                  <span className='text-gray-700 dark:text-gray-300'>
                    Dine-in
                  </span>
                </div>
              )}

              {placeDetails.outdoorSeating && (
                <div className='flex items-center'>
                  <span className='text-green-500 mr-2'>✓</span>
                  <span className='text-gray-700 dark:text-gray-300'>
                    Outdoor Seating
                  </span>
                </div>
              )}

              {placeDetails.goodForChildren && (
                <div className='flex items-center'>
                  <span className='text-green-500 mr-2'>✓</span>
                  <span className='text-gray-700 dark:text-gray-300'>
                    Good for Kids
                  </span>
                </div>
              )}

              {placeDetails.goodForGroups && (
                <div className='flex items-center'>
                  <span className='text-green-500 mr-2'>✓</span>
                  <span className='text-gray-700 dark:text-gray-300'>
                    Good for Groups
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {placeDetails.generativeSummary && (
        <div className='mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md'>
          <h4 className='font-semibold mb-2 text-gray-900 dark:text-white'>
            Summary
          </h4>
          <p className='text-gray-700 dark:text-gray-300'>
            {placeDetails.generativeSummary}
          </p>
        </div>
      )}
    </div>
  );
}
