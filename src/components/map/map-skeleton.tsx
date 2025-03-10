'use client';

import React from 'react';
import { Shimmer } from '@/components/ui/shimmer';

interface MapSkeletonProps {
  className?: string;
}

/**
 * A skeleton loading component for the map
 */
export default function MapSkeleton({ className }: MapSkeletonProps) {
  return (
    <div className={`flex-grow relative ${className || ''}`}>
      <div className='h-full w-full'>
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: 'rgb(229, 227, 223)',
            }}
          >
            {/* Map controls shimmer */}
            <div className='absolute bottom-4 right-4 z-10'>
              <Shimmer
                width={40}
                height={40}
                rounded='full'
                className='mb-2 shadow-md bg-white dark:bg-gray-800'
              />
              <Shimmer
                width={40}
                height={40}
                rounded='full'
                className='shadow-md bg-white dark:bg-gray-800'
              />
            </div>

            {/* Map attribution shimmer */}
            <div className='absolute bottom-0 left-0 z-10'>
              <Shimmer
                width={96}
                height={20}
                rounded='sm'
                className='bg-white dark:bg-gray-800 opacity-80'
              />
            </div>

            {/* Emoji markers shimmer - randomly positioned */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className='absolute'
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                }}
              >
                <Shimmer width={32} height={32} rounded='full' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
