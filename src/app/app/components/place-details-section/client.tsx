'use client';

import React from 'react';
import {
  HackerCardContent,
  HackerCardFooter,
  HackerInput,
  HackerButton,
} from '../ui-components';
import type { PlaceDetailsSectionProps } from '../types';

// This is a client component that handles all the interactive parts
const PlaceDetailsClient: React.FC<
  Omit<
    PlaceDetailsSectionProps,
    'showRawJson' | 'setShowRawJson' | 'handleClearPlaceDetails'
  >
> = ({
  placeId,
  setPlaceId,
  placeDetailsQuery,
  bypassCache,
  setBypassCache,
}) => {
  return (
    <>
      <HackerCardContent className='space-y-5'>
        <div className='space-y-3'>
          <label
            htmlFor='placeId'
            className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
          >
            Place ID
          </label>
          <HackerInput
            id='placeId'
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            placeholder='Enter a Google Places ID'
          />
          <p className='text-xs text-cyan-700 dark:text-cyan-700 font-mono mt-2'>
            $ Get a place ID from the nearby places results or click
            [GET_DETAILS] on a result
          </p>
        </div>

        <div className='flex items-center space-x-3 pt-2'>
          <input
            type='checkbox'
            id='bypassCacheDetails'
            checked={bypassCache}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBypassCache(e.target.checked)
            }
            className='h-4 w-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-700'
          />
          <label
            htmlFor='bypassCacheDetails'
            className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
          >
            Bypass Cache
          </label>
        </div>
      </HackerCardContent>

      <HackerCardFooter>
        <HackerButton
          onClick={() => placeDetailsQuery.refetch()}
          disabled={placeDetailsQuery.isLoading || !placeId}
          className='w-full'
        >
          {placeDetailsQuery.isLoading
            ? '[LOADING...]'
            : '[EXECUTE_PLACE_DETAILS_QUERY]'}
        </HackerButton>
      </HackerCardFooter>
    </>
  );
};

export default PlaceDetailsClient;
