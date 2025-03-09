'use client';

import React from 'react';
import { Shimmer, ShimmerContainer } from '@/components/ui/shimmer';

interface EmojiSelectorSkeletonProps {
  className?: string;
}

/**
 * A skeleton loading component for the EmojiSelector
 */
export default function EmojiSelectorSkeleton({
  className,
}: EmojiSelectorSkeletonProps) {
  return (
    <div
      className={`absolute top-0 z-50 py-2 sm:py-4 w-full ${className || ''}`}
    >
      <div className='w-full h-full flex items-center justify-center'>
        <div className='flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 py-1'>
          {/* Favorites button shimmer */}
          <Shimmer
            width='36px'
            height='36px'
            className='sm:w-12 sm:h-12 shadow-md bg-white dark:bg-gray-800'
            rounded='full'
          />

          {/* Categories container shimmer */}
          <ShimmerContainer className='flex items-center bg-white dark:bg-gray-800 rounded-full shadow-md overflow-x-auto max-w-[calc(100%-72px)] sm:max-w-[calc(100%-96px)]'>
            <div className='flex items-center space-x-1 px-1 sm:px-2 py-1'>
              {/* "All" category shimmer */}
              <Shimmer
                width='48px'
                height='32px'
                className='sm:w-16 sm:h-11 bg-gray-100 dark:bg-gray-700'
                rounded='full'
              />

              {/* Category emoji buttons shimmer - fewer on mobile */}
              <Shimmer
                width='32px'
                height='32px'
                className='sm:w-11 sm:h-11 bg-blue-500'
                rounded='full'
              />
              <Shimmer
                width='32px'
                height='32px'
                className='sm:w-11 sm:h-11 bg-blue-500'
                rounded='full'
              />
              <Shimmer
                width='32px'
                height='32px'
                className='sm:w-11 sm:h-11 bg-gray-100 dark:bg-gray-700'
                rounded='full'
              />
              <Shimmer
                width='32px'
                height='32px'
                className='sm:w-11 sm:h-11 bg-gray-100 dark:bg-gray-700'
                rounded='full'
              />
              <Shimmer
                width='32px'
                height='32px'
                className='sm:w-11 sm:h-11 bg-gray-100 dark:bg-gray-700'
                rounded='full'
              />
              <Shimmer
                width='32px'
                height='32px'
                className='hidden sm:block sm:w-11 sm:h-11 bg-gray-100 dark:bg-gray-700'
                rounded='full'
              />
              <Shimmer
                width='32px'
                height='32px'
                className='hidden sm:block sm:w-11 sm:h-11 bg-gray-100 dark:bg-gray-700'
                rounded='full'
              />
              <Shimmer
                width='32px'
                height='32px'
                className='hidden sm:block sm:w-11 sm:h-11 bg-gray-100 dark:bg-gray-700'
                rounded='full'
              />
            </div>
          </ShimmerContainer>

          {/* Shuffle button shimmer */}
          <Shimmer
            width='36px'
            height='36px'
            className='sm:w-12 sm:h-12 shadow-md bg-white dark:bg-gray-800'
            rounded='full'
          />
        </div>
      </div>
    </div>
  );
}
