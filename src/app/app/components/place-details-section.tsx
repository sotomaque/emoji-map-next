'use client';

import React from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/ui/star-rating';
import {
  HackerCard,
  HackerCardHeader,
  HackerCardContent,
  HackerCardFooter,
  HackerTitle,
  HackerInput,
  HackerButton,
  ResetButton,
  JsonDisplay,
  RequestUrlDisplay,
  LoadingSpinner,
} from './ui-components';
import type { PlaceDetailsSectionProps } from './types';

const PlaceDetailsSection: React.FC<PlaceDetailsSectionProps> = ({
  placeId,
  setPlaceId,
  showRawJson,
  setShowRawJson,
  placeDetailsQuery,
  bypassCache,
  setBypassCache,
  handleClearPlaceDetails,
}) => {
  // Construct the request URL for display
  const getRequestUrl = () => {
    const params = new URLSearchParams({
      id: placeId,
    });

    // Add bypassCache parameter if needed
    if (bypassCache) {
      params.append('bypassCache', 'true');
    }

    return `/api/places/details?${params.toString()}`;
  };

  // Helper function to render a detail field if it exists
  const renderDetailField = (label: string, value: unknown) => {
    if (value === undefined || value === null) return null;

    // Format the value based on its type
    let formattedValue: string;
    if (typeof value === 'boolean') {
      formattedValue = value ? 'Yes' : 'No';
    } else if (typeof value === 'object') {
      // Handle objects that might have a text property
      if (
        value &&
        'text' in value &&
        typeof (value as { text: unknown }).text === 'string'
      ) {
        formattedValue = (value as { text: string }).text;
      } else {
        // For other objects, stringify them
        formattedValue = JSON.stringify(value);
      }
    } else {
      formattedValue = String(value);
    }

    return (
      <div className='flex justify-between items-start py-2 border-b border-cyan-800 last:border-b-0'>
        <span className='font-medium text-cyan-400'>{label}:</span>
        <span className='text-right text-cyan-300 max-w-[60%]'>
          {formattedValue}
        </span>
      </div>
    );
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Place ID copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  // Function to reset the component state
  const handleReset = () => {
    setPlaceId('');
    setBypassCache(false);
    setShowRawJson(false);
    handleClearPlaceDetails(); // Clear the query data
    toast.success('Place details form reset');
  };
  // TODO: when you click get details / get photos,
  // focus relevant card (details or photos)

  // TODO: subtle focus glow on 'active' card'
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
      <HackerCard>
        <HackerCardHeader>
          <HackerTitle>place_details_api</HackerTitle>
          <div className='text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            Test the /api/places/details endpoint with a place ID
          </div>
        </HackerCardHeader>

        <HackerCardContent className='space-y-5'>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <label
                htmlFor='placeId'
                className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
              >
                Place ID
              </label>
              {placeId && (
                <HackerButton
                  onClick={() => copyToClipboard(placeId)}
                  className='text-xs ml-2'
                >
                  [COPY_ID]
                </HackerButton>
              )}
            </div>
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
      </HackerCard>

      <HackerCard>
        <HackerCardHeader>
          <div className='flex justify-between items-center'>
            <HackerTitle>place_details_result</HackerTitle>
            <ResetButton onClick={handleReset} />
          </div>
          <div className='flex items-center justify-between text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            <span>Place details API response will appear here</span>
            <div className='flex items-center space-x-3'>
              <input
                type='checkbox'
                id='show-raw-json-details'
                checked={showRawJson}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setShowRawJson(e.target.checked)
                }
                className='h-4 w-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-700'
              />
              <Label
                htmlFor='show-raw-json-details'
                className='text-xs text-cyan-400 dark:text-cyan-400 font-mono'
              >
                Show Raw JSON
              </Label>
            </div>
          </div>
        </HackerCardHeader>

        <HackerCardContent>
          <div className='flex justify-between items-center mb-4'>
            {/* Display the request URL */}
            {placeDetailsQuery.data ? (
              <RequestUrlDisplay url={getRequestUrl()} />
            ) : (
              <div className='flex-1'></div>
            )}
            <HackerButton
              onClick={handleClearPlaceDetails}
              disabled={!placeDetailsQuery.data}
              className='text-xs ml-2'
            >
              [CLEAR]
            </HackerButton>
          </div>

          {placeDetailsQuery.isError && (
            <div className='p-4 mb-5 bg-zinc-950 dark:bg-zinc-950 border border-red-700 text-red-400 dark:text-red-400 rounded-sm font-mono shadow-[0_0_10px_rgba(248,113,113,0.2)]'>
              <p className='font-bold'>[ERROR]</p>
              <p>
                {placeDetailsQuery.error?.message || 'Unknown error occurred'}
              </p>
            </div>
          )}

          <div className='min-h-[400px]'>
            {placeDetailsQuery.isLoading ? (
              <LoadingSpinner />
            ) : placeDetailsQuery.data ? (
              <>
                {showRawJson ? (
                  <JsonDisplay data={placeDetailsQuery.data} />
                ) : (
                  <div className='space-y-5 max-h-96 overflow-y-auto text-cyan-400 dark:text-cyan-400 font-mono'>
                    {/* API Response Metadata */}
                    <div className='p-3 border border-purple-800 rounded-sm bg-zinc-950 mb-4'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='font-medium text-purple-400'>
                          Cache Hit:
                        </span>
                        <span className='text-purple-300'>
                          {placeDetailsQuery.data.cacheHit ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium text-purple-400'>
                          Count:
                        </span>
                        <span className='text-purple-300'>
                          {placeDetailsQuery.data.count}
                        </span>
                      </div>
                    </div>

                    {/* Place details */}
                    {placeDetailsQuery.data.data && (
                      <div className='space-y-3 mt-4'>
                        {/* Name */}
                        <h3 className='text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500'>
                          {placeDetailsQuery.data.data.name ||
                            'Name not available'}
                        </h3>

                        <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
                          <div className='space-y-1'>
                            {renderDetailField(
                              'Name',
                              placeDetailsQuery.data.data.name
                            )}
                            {renderDetailField(
                              'Primary Type',
                              placeDetailsQuery.data.data.primaryTypeDisplayName
                            )}
                            <div className='flex justify-between items-start py-2 border-b border-cyan-800 last:border-b-0'>
                              <span className='font-medium text-cyan-400'>
                                Rating:
                              </span>
                              <div className='text-right text-cyan-300 max-w-[60%] flex items-center gap-2'>
                                <StarRating
                                  rating={
                                    placeDetailsQuery.data.data.rating || 0
                                  }
                                  color='text-yellow-400'
                                  size='sm'
                                  roundToHalf={true}
                                />
                                <span>
                                  (
                                  {placeDetailsQuery.data.data.rating ||
                                    'No rating available'}
                                  )
                                </span>
                              </div>
                            </div>
                            <div className='flex justify-between items-start py-2 border-b border-cyan-800 last:border-b-0'>
                              <span className='font-medium text-cyan-400'>
                                Price Level:
                              </span>
                              <div className='text-right text-cyan-300 max-w-[60%]'>
                                {placeDetailsQuery.data.data.priceLevel ===
                                null ? (
                                  <span>Not specified</span>
                                ) : (
                                  <span>
                                    {'$'.repeat(
                                      placeDetailsQuery.data.data.priceLevel
                                    )}
                                  </span>
                                )}
                                {placeDetailsQuery.data.data.isFree && (
                                  <span className='ml-2 text-green-400'>
                                    (Free)
                                  </span>
                                )}
                              </div>
                            </div>
                            {renderDetailField(
                              'User Rating Count',
                              placeDetailsQuery.data.data.userRatingCount
                            )}
                            {renderDetailField(
                              'Currently Open',
                              placeDetailsQuery.data.data.openNow
                            )}
                          </div>
                        </div>

                        {/* Service Options */}
                        <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
                          <p className='text-sm font-medium mb-2 text-cyan-400'>
                            Service Options:
                          </p>
                          <div className='space-y-1'>
                            {renderDetailField(
                              'Takeout',
                              placeDetailsQuery.data.data.takeout
                            )}
                            {renderDetailField(
                              'Delivery',
                              placeDetailsQuery.data.data.delivery
                            )}
                            {renderDetailField(
                              'Dine In',
                              placeDetailsQuery.data.data.dineIn
                            )}
                            {renderDetailField(
                              'Outdoor Seating',
                              placeDetailsQuery.data.data.outdoorSeating
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
                          <p className='text-sm font-medium mb-2 text-cyan-400'>
                            Features:
                          </p>
                          <div className='space-y-1'>
                            {renderDetailField(
                              'Live Music',
                              placeDetailsQuery.data.data.liveMusic
                            )}
                            {renderDetailField(
                              'Menu For Children',
                              placeDetailsQuery.data.data.menuForChildren
                            )}
                            {renderDetailField(
                              'Serves Dessert',
                              placeDetailsQuery.data.data.servesDessert
                            )}
                            {renderDetailField(
                              'Serves Coffee',
                              placeDetailsQuery.data.data.servesCoffee
                            )}
                            {renderDetailField(
                              'Good For Children',
                              placeDetailsQuery.data.data.goodForChildren
                            )}
                            {renderDetailField(
                              'Good For Groups',
                              placeDetailsQuery.data.data.goodForGroups
                            )}
                            {renderDetailField(
                              'Allows Dogs',
                              placeDetailsQuery.data.data.allowsDogs
                            )}
                            {renderDetailField(
                              'Restroom',
                              placeDetailsQuery.data.data.restroom
                            )}
                          </div>
                        </div>

                        {/* Payment Options */}
                        {placeDetailsQuery.data.data.paymentOptions && (
                          <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
                            <p className='text-sm font-medium mb-2 text-cyan-400'>
                              Payment Options:
                            </p>
                            <div className='space-y-1'>
                              {Object.entries(
                                placeDetailsQuery.data.data.paymentOptions
                              ).map(([key, value]) =>
                                renderDetailField(key, value)
                              )}
                            </div>
                          </div>
                        )}

                        {/* Editorial Summary */}
                        <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
                          <p className='text-sm font-medium mb-2 text-cyan-400'>
                            Editorial Summary:
                          </p>
                          {placeDetailsQuery.data.data.editorialSummary ? (
                            <p className='text-sm text-cyan-300'>
                              {placeDetailsQuery.data.data.editorialSummary}
                            </p>
                          ) : (
                            <p className='text-sm text-cyan-300'>
                              No editorial summary available
                            </p>
                          )}
                        </div>

                        {/* Generative Summary */}
                        <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
                          <p className='text-sm font-medium mb-2 text-cyan-400'>
                            Generative Summary:
                          </p>
                          {placeDetailsQuery.data.data.generativeSummary ? (
                            <p className='text-sm text-cyan-300'>
                              {placeDetailsQuery.data.data.generativeSummary}
                            </p>
                          ) : (
                            <p className='text-sm text-cyan-300'>
                              No generative summary available
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reviews section */}
                    {placeDetailsQuery.data.data?.reviews &&
                      placeDetailsQuery.data.data.reviews.length > 0 && (
                        <div className='mt-5'>
                          <p className='text-sm font-medium mb-3 text-cyan-400'>
                            Reviews:
                          </p>

                          <div className='space-y-4'>
                            {placeDetailsQuery.data.data.reviews.map(
                              (review, index) => (
                                <div
                                  key={index}
                                  className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'
                                >
                                  <div className='flex items-center justify-between mb-2'>
                                    <span className='font-medium'>
                                      {review.authorAttribution?.displayName ||
                                        'Anonymous'}
                                    </span>
                                    <StarRating
                                      rating={review.rating}
                                      color='text-cyan-400'
                                      size='sm'
                                    />
                                  </div>
                                  <p className='text-xs text-cyan-600 mb-2'>
                                    {review.relativePublishTimeDescription ||
                                      'Unknown date'}
                                  </p>
                                  <p className='text-sm'>
                                    {typeof review.text === 'object' &&
                                    review.text?.text
                                      ? review.text.text
                                      : typeof review.text === 'string'
                                      ? review.text
                                      : 'No review text'}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </>
            ) : (
              !placeDetailsQuery.isError && (
                <p className='text-cyan-700 dark:text-cyan-700 text-center py-8 font-mono'>
                  $ Enter a place ID and click [EXECUTE_PLACE_DETAILS_QUERY] to
                  see results <span className='animate-pulse'>_</span>
                </p>
              )
            )}
          </div>
        </HackerCardContent>
      </HackerCard>
    </div>
  );
};

export default PlaceDetailsSection;
