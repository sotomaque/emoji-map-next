'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUpdateRatings, useToken } from '../../context/user-context';
import type { Rating } from '@prisma/client';

interface RatingsTableProps {
  ratings?: Rating[];
  onViewPlace: (placeId: string) => void;
}

// Function to submit a rating
const submitRating = async ({
  token,
  placeId,
  rating,
}: {
  token: string;
  placeId: string;
  rating: number;
}) => {
  const response = await fetch('/api/places/rating', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ placeId, rating }),
  });

  if (!response.ok) {
    throw new Error(`Error submitting rating: ${response.statusText}`);
  }

  return response.json();
};

export function RatingsTable({ ratings, onViewPlace }: RatingsTableProps) {
  // If no ratings, show a message
  if (!ratings || ratings.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
        You haven&apos;t rated any places yet.
      </div>
    );
  }

  const handleViewClick = (placeId: string) => {
    onViewPlace(placeId);
  };

  return (
    <div>
      <h2 className='text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500'>
        You have rated ({ratings.length})
      </h2>

      <div className='overflow-x-auto -mx-6'>
        <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
          <thead className='bg-gray-50 dark:bg-gray-800'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'
              >
                Place ID
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'
              >
                Rated On
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
            {ratings.map((rating) => (
              <tr
                key={rating.id}
                className='hover:bg-gray-50 dark:hover:bg-gray-800'
              >
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                  {rating.placeId}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                  {new Date(rating.createdAt).toLocaleDateString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-right space-x-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30'
                    onClick={() => handleViewClick(rating.placeId)}
                  >
                    <Eye className='mr-1 h-4 w-4' />
                    View
                  </Button>

                  <RatingStars
                    placeId={rating.placeId}
                    rating={rating.rating}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RatingStars({ placeId, rating }: { placeId: string; rating: number }) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const token = useToken();
  const { updateRating } = useUpdateRatings();

  // Toggle favorite mutation
  const { mutate: submitUserRating, isPending: isSubmittingRating } =
    useMutation({
      mutationFn: submitRating,
      onSuccess: (data) => {
        // Show toast notification based on the action
        if (data.action === 'added') {
          toast.success(`Rating added: ${data.rating.rating} stars`);
        } else if (data.action === 'updated') {
          toast.success(`Rating updated to ${data.rating.rating} stars`);
        } else if (data.action === 'removed') {
          toast.success('Rating removed');
        }
      },
      onError: (error) => {
        toast.error(
          `Failed to submit rating: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      },
    });

  const handleStarClick = (placeId: string, rating: number) => {
    if (!rating || !placeId) return;

    // Optimistically update the user context
    updateRating(placeId, rating);

    // Submit the rating to the server
    submitUserRating({
      token,
      placeId,
      rating,
    });
  };

  // Helper function to render interactive stars
  const renderInteractiveStars = (placeId: string, rating: number) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      const isSelected =
        (hoveredStar !== null && i <= hoveredStar) ||
        (hoveredStar === null && placeId && rating && i <= rating);

      stars.push(
        <button
          key={`star-${i}`}
          className={`text-2xl focus:outline-none transition-colors ${
            isSelected
              ? 'text-yellow-400'
              : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
          }`}
          onClick={() => handleStarClick(placeId, i)}
          onMouseEnter={() => setHoveredStar(i)}
          onMouseLeave={() => setHoveredStar(null)}
          aria-label={`Rate ${i} stars`}
          disabled={isSubmittingRating}
        >
          ★
        </button>
      );
    }

    return (
      <div className='flex items-center'>
        <div className='flex'>{stars}</div>
        {isSubmittingRating && (
          <span className='ml-2 text-sm text-cyan-500 animate-pulse'>
            Submitting...
          </span>
        )}
      </div>
    );
  };

  return (
    <div className='flex space-x-1'>
      {renderInteractiveStars(placeId, rating)}
    </div>
  );
}
