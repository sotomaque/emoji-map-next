'use client';

import { Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Favorite } from '@prisma/client';

interface FavoritesTableProps {
  favorites?: Favorite[];
  onViewPlace: (placeId: string) => void;
}

export default function FavoritesTable({
  favorites,
  onViewPlace,
}: FavoritesTableProps) {
  // If no favorites, show a message
  if (!favorites || favorites.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
        You haven&apos;t favorited any places yet.
      </div>
    );
  }

  const handleViewClick = (placeId: string) => {
    onViewPlace(placeId);
  };

  const handleUnfavoriteClick = (placeId: string) => {
    console.log('UNFAVORITE CLICKED', placeId);
  };

  return (
    <div>
      <h2 className='text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500'>
        Your Favorite Places ({favorites.length})
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
                Favorited On
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
            {favorites.map((favorite) => (
              <tr
                key={favorite.id}
                className='hover:bg-gray-50 dark:hover:bg-gray-800'
              >
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                  {favorite.placeId}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                  {new Date(favorite.createdAt).toLocaleDateString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-right space-x-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30'
                    onClick={() => handleViewClick(favorite.placeId)}
                  >
                    <Eye className='mr-1 h-4 w-4' />
                    View
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30'
                    onClick={() => handleUnfavoriteClick(favorite.placeId)}
                  >
                    <Trash2 className='mr-1 h-4 w-4' />
                    Unfavorite
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
