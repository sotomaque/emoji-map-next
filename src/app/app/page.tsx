'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGateValue } from '@statsig/react-bindings';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FEATURE_FLAGS } from '@/constants/feature-flags';
import type { DetailResponse } from '@/types/details';
import type { PhotosResponse } from '@/types/google-photos';
import type { PlacesResponse, Place } from '@/types/places';
import type { UseQueryResult } from '@tanstack/react-query';

// Define interfaces for the nested objects in the response
interface TextObject {
  text: string;
  languageCode?: string;
}

interface CurrentOpeningHours {
  openNow: boolean;
  periods?: unknown[];
  weekdayDescriptions?: string[];
}

interface GenerativeSummary {
  overview: TextObject;
}

// Define an interface for the enhanced response that includes version and meta
interface EnhancedDetailResponse extends DetailResponse {
  version?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    params: {
      id: string;
      bypassCache: boolean;
      version: string;
    };
  };
}

// Define an interface for the enhanced places response
interface EnhancedPlacesResponse extends PlacesResponse {
  version?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    params: {
      location: string;
      textQuery: string;
      limit: number;
      bypassCache: boolean;
      openNow: boolean;
      version: string;
    };
  };
}

// Default location (New York City)
const DEFAULT_LOCATION = '40.7128,-74.0060';
const DEFAULT_TEXT_QUERY = 'pizza|beer';
const DEFAULT_LIMIT = 20;
const DEFAULT_PHOTO_ID = '';
const DEFAULT_PLACE_ID = '';

// Loading spinner component
const LoadingSpinner = () => (
  <div className='flex flex-col justify-center items-center py-8'>
    <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mb-4'></div>
    <div className='text-cyan-400 font-mono text-lg'>
      <span className='animate-pulse'>[</span>LOADING
      <span className='animate-pulse'>_]</span>
    </div>
  </div>
);

// JSON display component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JsonDisplay = ({ data }: { data: any }) => {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => {
        toast.success('JSON copied to clipboard');
      })
      .catch((error) => {
        console.error('Failed to copy JSON:', error);
        toast.error('Failed to copy JSON to clipboard');
      });
  };

  return (
    <div className='relative'>
      <pre className='bg-zinc-950 text-cyan-400 dark:bg-zinc-950 dark:text-cyan-400 p-5 rounded-sm overflow-auto max-h-96 text-xs border border-cyan-700 font-mono shadow-[0_0_10px_rgba(6,182,212,0.15)]'>
        {JSON.stringify(data, null, 2)}
      </pre>
      <Button
        size='sm'
        variant='outline'
        className='absolute top-3 right-3 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border-cyan-700 font-mono text-xs hover:text-cyan-300 hover:border-cyan-500 transition-colors duration-200 px-3 py-1'
        onClick={copyToClipboard}
      >
        [COPY]
      </Button>
    </div>
  );
};

// URL display component for showing API request URLs
const RequestUrlDisplay = ({ url }: { url: string }) => {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('URL copied to clipboard');
      })
      .catch((error) => {
        console.error('Failed to copy URL:', error);
        toast.error('Failed to copy URL to clipboard');
      });
  };

  return (
    <div className='relative mt-4 mb-5'>
      <div className='bg-zinc-950 text-cyan-400 dark:bg-zinc-950 dark:text-cyan-400 p-4 rounded-sm overflow-x-auto text-xs border border-cyan-700 font-mono shadow-[0_0_10px_rgba(6,182,212,0.15)]'>
        $ curl &quot;{url}&quot;
      </div>
      <Button
        size='sm'
        variant='outline'
        className='absolute top-3 right-3 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border-cyan-700 font-mono text-xs hover:text-cyan-300 hover:border-cyan-500 transition-colors duration-200 px-3 py-1'
        onClick={copyToClipboard}
      >
        [COPY]
      </Button>
    </div>
  );
};

// Cyberpunk-style section title component
const HackerTitle = ({ children }: { children: React.ReactNode }) => (
  <div className='font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center space-x-2 text-lg mb-1'>
    <span className='text-cyan-400'>$</span>
    <span className='animate-pulse text-purple-500'>_</span>
    <span>{children}</span>
  </div>
);

// Custom Card component with cyberpunk style
const HackerCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-zinc-900 dark:bg-zinc-900 border border-cyan-800 rounded-sm ${className} shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-sm`}
  >
    {children}
  </div>
);

// Custom Card Header with cyberpunk style
const HackerCardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className='border-b border-cyan-800 p-5 bg-gradient-to-r from-zinc-950 to-zinc-900 dark:from-zinc-950 dark:to-zinc-900'>
    {children}
  </div>
);

// Custom Card Content with cyberpunk style
const HackerCardContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-5 ${className}`}>{children}</div>;

// Custom Card Footer with cyberpunk style
const HackerCardFooter = ({ children }: { children: React.ReactNode }) => (
  <div className='border-t border-cyan-800 p-5 bg-gradient-to-r from-zinc-950 to-zinc-900 dark:from-zinc-950 dark:to-zinc-900'>
    {children}
  </div>
);

// Custom Input with cyberpunk style
const HackerInput = ({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <Input
    {...props}
    className='bg-zinc-950 dark:bg-zinc-950 border-cyan-800 text-cyan-400 font-mono rounded-sm focus:ring-cyan-700 focus:border-cyan-700 placeholder:text-cyan-900 shadow-[0_0_5px_rgba(6,182,212,0.15)] py-2 px-3'
  />
);

// Custom Button with cyberpunk style
const HackerButton = ({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) => (
  <Button
    {...props}
    className={`bg-zinc-950 dark:bg-zinc-950 hover:bg-zinc-900 text-cyan-400 border border-cyan-700 rounded-sm font-mono ${className} hover:text-cyan-300 hover:border-cyan-500 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-200 py-2 px-4`}
  >
    {children}
  </Button>
);

// Add a reset button component with cyberpunk style
const ResetButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className='ml-2 px-2 py-1 text-xs bg-zinc-950 hover:bg-zinc-900 text-red-400 border border-red-700 rounded-sm font-mono hover:text-red-300 hover:border-red-500 hover:shadow-[0_0_10px_rgba(248,113,113,0.3)] transition-all duration-200'
  >
    [RESET]
  </button>
);

// Section components to wrap in error boundaries
const NearbyPlacesSection = ({
  location,
  setLocation,
  textQuery,
  setTextQuery,
  limit,
  setLimit,
  bypassCache,
  setBypassCache,
  openNow,
  setOpenNow,
  gettingLocation,
  locationError,
  getCurrentLocation,
  showRawJson,
  setShowRawJson,
  nearbyPlacesQuery,
  handleGetDetails,
  handleGetPhotos,
  handleClearNearbyPlaces,
}: {
  location: string;
  setLocation: (value: string) => void;
  textQuery: string;
  setTextQuery: (value: string) => void;
  limit: number;
  setLimit: (value: number) => void;
  bypassCache: boolean;
  setBypassCache: (value: boolean) => void;
  openNow: boolean;
  setOpenNow: (value: boolean) => void;
  gettingLocation: boolean;
  locationError: string | null;
  getCurrentLocation: () => void;
  showRawJson: boolean;
  setShowRawJson: (value: boolean) => void;
  nearbyPlacesQuery: UseQueryResult<EnhancedPlacesResponse, Error>;
  handleGetDetails: (id: string) => void;
  handleGetPhotos: (id: string) => void;
  handleClearNearbyPlaces: () => void;
}) => {
  // Construct the request URL for display
  const getRequestUrl = () => {
    const params = new URLSearchParams({
      location,
      textQuery,
      limit: limit.toString(),
    });

    if (bypassCache) {
      params.append('bypassCache', 'true');
    }

    if (openNow) {
      params.append('openNow', 'true');
    }

    return `/api/places/nearby?${params.toString()}`;
  };

  // Helper function to render a place card
  const renderPlaceCard = (place: Place) => (
    <li
      key={place.id}
      className='p-4 border border-cyan-800 rounded-sm bg-zinc-950 hover:bg-zinc-900 transition-colors duration-200'
    >
      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center space-x-2'>
            <span className='text-xl'>{place.emoji}</span>
            <span className='font-medium text-cyan-300'>ID: {place.id}</span>
          </div>

          <div className='text-sm text-cyan-400'>
            <div className='flex items-center space-x-2'>
              <span className='font-medium'>Location:</span>
              <span>
                {place.location?.latitude.toFixed(4)},{' '}
                {place.location?.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        <div className='flex flex-col space-y-2'>
          <HackerButton
            className='text-xs w-full'
            onClick={() => handleGetDetails(place.id)}
          >
            [GET_DETAILS]
          </HackerButton>
          <HackerButton
            className='text-xs w-full'
            onClick={() => handleGetPhotos(place.id)}
          >
            [GET_PHOTOS]
          </HackerButton>
        </div>
      </div>
    </li>
  );

  // Function to reset the component state
  const handleReset = () => {
    setLocation(DEFAULT_LOCATION);
    setTextQuery(DEFAULT_TEXT_QUERY);
    setLimit(DEFAULT_LIMIT);
    setBypassCache(false);
    setOpenNow(false);
    setShowRawJson(false);
    handleClearNearbyPlaces(); // Clear the query data
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <HackerCard>
        <HackerCardHeader>
          <CardTitle>
            <HackerTitle>nearby_places_api</HackerTitle>
          </CardTitle>
          <CardDescription className='text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            Test the /api/places/nearby endpoint with custom parameters
          </CardDescription>
        </HackerCardHeader>

        <HackerCardContent className='space-y-5'>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <label
                htmlFor='location'
                className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
              >
                Location (latitude,longitude)
              </label>
              <HackerButton
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className='text-xs ml-2'
              >
                {gettingLocation ? '[LOCATING...]' : '[USE_CURRENT_LOCATION]'}
              </HackerButton>
            </div>
            <HackerInput
              id='location'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder='40.7128,-74.0060'
            />
            {locationError && (
              <p className='text-xs text-red-400 dark:text-red-400 mt-1 font-mono'>
                [ERROR] {locationError}
              </p>
            )}
          </div>

          <div className='space-y-3'>
            <label
              htmlFor='textQuery'
              className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
            >
              Text Query (use | to separate multiple queries)
            </label>
            <HackerInput
              id='textQuery'
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              placeholder='pizza|beer'
            />
          </div>

          <div className='space-y-3'>
            <label
              htmlFor='limit'
              className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
            >
              Limit
            </label>
            <HackerInput
              id='limit'
              type='number'
              value={limit}
              onChange={(e) =>
                setLimit(parseInt(e.target.value) || DEFAULT_LIMIT)
              }
              placeholder='20'
            />
          </div>

          <div className='flex items-center space-x-3 pt-2'>
            <input
              type='checkbox'
              id='bypassCache'
              checked={bypassCache}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBypassCache(e.target.checked)
              }
              className='h-4 w-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-700'
            />
            <label
              htmlFor='bypassCache'
              className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
            >
              Bypass Cache
            </label>
          </div>

          <div className='flex items-center space-x-3'>
            <input
              type='checkbox'
              id='openNow'
              checked={openNow}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOpenNow(e.target.checked)
              }
              className='h-4 w-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-700'
            />
            <label
              htmlFor='openNow'
              className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
            >
              Open Now
            </label>
          </div>
        </HackerCardContent>

        <HackerCardFooter>
          <HackerButton
            onClick={() => nearbyPlacesQuery.refetch()}
            disabled={nearbyPlacesQuery.isLoading}
            className='w-full'
          >
            {nearbyPlacesQuery.isLoading
              ? '[LOADING...]'
              : '[EXECUTE_NEARBY_PLACES_QUERY]'}
          </HackerButton>
        </HackerCardFooter>
      </HackerCard>

      <HackerCard>
        <HackerCardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>
              <HackerTitle>results</HackerTitle>
            </CardTitle>
            <ResetButton onClick={handleReset} />
          </div>
          <CardDescription className='flex items-center justify-between text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            <span>API response will appear here</span>
            <div className='flex items-center space-x-3'>
              <input
                type='checkbox'
                id='show-raw-json-nearby'
                checked={showRawJson}
                onChange={(e) => setShowRawJson(e.target.checked)}
                className='h-4 w-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-700'
              />
              <Label
                htmlFor='show-raw-json-nearby'
                className='text-xs text-cyan-400 dark:text-cyan-400 font-mono'
              >
                Show Raw JSON
              </Label>
            </div>
          </CardDescription>
        </HackerCardHeader>

        <HackerCardContent>
          <div className='flex justify-between items-center mb-4'>
            {/* Display the request URL */}
            {nearbyPlacesQuery.data ? (
              <RequestUrlDisplay url={getRequestUrl()} />
            ) : (
              <div className='flex-1'></div>
            )}
            <HackerButton
              onClick={handleClearNearbyPlaces}
              disabled={!nearbyPlacesQuery.data}
              className='text-xs ml-2'
            >
              [CLEAR]
            </HackerButton>
          </div>

          {nearbyPlacesQuery.isError && (
            <div className='p-4 mb-5 bg-zinc-950 dark:bg-zinc-950 border border-red-700 text-red-400 dark:text-red-400 rounded-sm font-mono shadow-[0_0_10px_rgba(248,113,113,0.2)]'>
              <p className='font-bold'>[ERROR]</p>
              <p>
                {nearbyPlacesQuery.error?.message || 'Unknown error occurred'}
              </p>
            </div>
          )}

          <div className='min-h-[400px]'>
            {nearbyPlacesQuery.isLoading ? (
              <LoadingSpinner />
            ) : nearbyPlacesQuery.data ? (
              <>
                {showRawJson ? (
                  <JsonDisplay data={nearbyPlacesQuery.data} />
                ) : (
                  <div className='space-y-5 text-cyan-400 dark:text-cyan-400 font-mono'>
                    {/* API Response Metadata */}
                    <div className='p-3 border border-purple-800 rounded-sm bg-zinc-950 mb-4'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='font-medium text-purple-400'>
                          Cache Hit:
                        </span>
                        <span className='text-purple-300'>
                          {nearbyPlacesQuery.data.cacheHit ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium text-purple-400'>
                          Total Places:
                        </span>
                        <span className='text-purple-300'>
                          {nearbyPlacesQuery.data.count}
                        </span>
                      </div>
                    </div>

                    {/* Places list */}
                    <div className='space-y-3'>
                      <h3 className='text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500'>
                        Places Found: {nearbyPlacesQuery.data.count}
                      </h3>

                      <div className='max-h-96 overflow-y-auto'>
                        {nearbyPlacesQuery.data.data &&
                        nearbyPlacesQuery.data.data.length > 0 ? (
                          <ul className='grid grid-cols-1 gap-3'>
                            {nearbyPlacesQuery.data.data.map((place) =>
                              renderPlaceCard(place)
                            )}
                          </ul>
                        ) : (
                          <div className='p-4 border border-cyan-800 rounded-sm bg-zinc-950 text-center'>
                            <p className='text-cyan-700 dark:text-cyan-700'>
                              No places found
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              !nearbyPlacesQuery.isError && (
                <p className='text-cyan-700 dark:text-cyan-700 text-center py-8 font-mono'>
                  $ Click [EXECUTE_NEARBY_PLACES_QUERY] to see results{' '}
                  <span className='animate-pulse'>_</span>
                </p>
              )
            )}
          </div>
        </HackerCardContent>
      </HackerCard>
    </div>
  );
};

const PlaceDetailsSection = ({
  placeId,
  setPlaceId,
  showRawJson,
  setShowRawJson,
  placeDetailsQuery,
  bypassCache,
  setBypassCache,
  handleClearPlaceDetails,
}: {
  placeId: string;
  setPlaceId: (value: string) => void;
  showRawJson: boolean;
  setShowRawJson: (value: boolean) => void;
  placeDetailsQuery: UseQueryResult<EnhancedDetailResponse, Error>;
  bypassCache: boolean;
  setBypassCache: (value: boolean) => void;
  handleClearPlaceDetails: () => void;
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

  // Function to reset the component state
  const handleReset = () => {
    setPlaceId(DEFAULT_PLACE_ID);
    setBypassCache(false);
    setShowRawJson(false);
    handleClearPlaceDetails(); // Clear the query data
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
      <HackerCard>
        <HackerCardHeader>
          <CardTitle>
            <HackerTitle>place_details_api</HackerTitle>
          </CardTitle>
          <CardDescription className='text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            Test the /api/places/details endpoint with a place ID
          </CardDescription>
        </HackerCardHeader>

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
      </HackerCard>

      <HackerCard>
        <HackerCardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>
              <HackerTitle>place_details_result</HackerTitle>
            </CardTitle>
            <ResetButton onClick={handleReset} />
          </div>
          <CardDescription className='flex items-center justify-between text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
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
          </CardDescription>
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
                              typeof placeDetailsQuery.data.data
                                .primaryTypeDisplayName === 'object'
                                ? (
                                    placeDetailsQuery.data.data
                                      .primaryTypeDisplayName as TextObject
                                  ).text
                                : placeDetailsQuery.data.data
                                    .primaryTypeDisplayName
                            )}
                            {renderDetailField(
                              'Rating',
                              placeDetailsQuery.data.data.rating
                            )}
                            {renderDetailField(
                              'Price Level',
                              placeDetailsQuery.data.data.priceLevel
                            )}
                            {renderDetailField(
                              'User Rating Count',
                              placeDetailsQuery.data.data.userRatingCount
                            )}
                            {renderDetailField(
                              'Currently Open',
                              'currentOpeningHours' in
                                placeDetailsQuery.data.data
                                ? (
                                    placeDetailsQuery.data.data as {
                                      currentOpeningHours: CurrentOpeningHours;
                                    }
                                  ).currentOpeningHours.openNow
                                : placeDetailsQuery.data.data.openNow
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
                        {placeDetailsQuery.data.data.editorialSummary && (
                          <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
                            <p className='text-sm font-medium mb-2 text-cyan-400'>
                              Editorial Summary:
                            </p>
                            <p className='text-sm text-cyan-300'>
                              {typeof placeDetailsQuery.data.data
                                .editorialSummary === 'object'
                                ? (
                                    placeDetailsQuery.data.data
                                      .editorialSummary as TextObject
                                  ).text
                                : placeDetailsQuery.data.data.editorialSummary}
                            </p>
                          </div>
                        )}

                        {/* Generative Summary */}
                        {placeDetailsQuery.data.data.generativeSummary && (
                          <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
                            <p className='text-sm font-medium mb-2 text-cyan-400'>
                              Generative Summary:
                            </p>
                            <p className='text-sm text-cyan-300'>
                              {typeof placeDetailsQuery.data.data
                                .generativeSummary === 'object'
                                ? (
                                    placeDetailsQuery.data.data
                                      .generativeSummary as GenerativeSummary
                                  ).overview.text
                                : placeDetailsQuery.data.data.generativeSummary}
                            </p>
                          </div>
                        )}
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
                                    <span>{review.rating} ⭐</span>
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

const PhotosSection = ({
  photoId,
  setPhotoId,
  showRawJson,
  setShowRawJson,
  photoQuery,
  bypassCache,
  setBypassCache,
  handleClearPhotos,
}: {
  photoId: string;
  setPhotoId: (value: string) => void;
  showRawJson: boolean;
  setShowRawJson: (value: boolean) => void;
  photoQuery: UseQueryResult<PhotosResponse, Error>;
  bypassCache: boolean;
  setBypassCache: (value: boolean) => void;
  handleClearPhotos: () => void;
}) => {
  // State to track which photo is being viewed
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );

  // Construct the request URL for display
  const getRequestUrl = () => {
    const params = new URLSearchParams({
      id: photoId,
    });

    // Add bypassCache parameter if needed
    if (bypassCache) {
      params.append('bypassCache', 'true');
    }

    return `/api/places/photos?${params.toString()}`;
  };

  // Function to reset the component state
  const handleReset = () => {
    setPhotoId(DEFAULT_PHOTO_ID);
    setBypassCache(false);
    setShowRawJson(false);
    setSelectedPhotoIndex(null);
    handleClearPhotos(); // Clear the query data
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
      <HackerCard>
        <HackerCardHeader>
          <CardTitle>
            <HackerTitle>photos_api</HackerTitle>
          </CardTitle>
          <CardDescription className='text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            Test the /api/places/photos endpoint with a photo ID
          </CardDescription>
        </HackerCardHeader>

        <HackerCardContent className='space-y-5'>
          <div className='space-y-3'>
            <label
              htmlFor='photoId'
              className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
            >
              Photo ID
            </label>
            <HackerInput
              id='photoId'
              value={photoId}
              onChange={(e) => setPhotoId(e.target.value)}
              placeholder='Enter a Google Places photo ID'
            />
            <p className='text-xs text-cyan-700 dark:text-cyan-700 font-mono mt-2'>
              $ Get a photo ID from a place result first
            </p>
          </div>

          <div className='flex items-center space-x-3 pt-2'>
            <input
              type='checkbox'
              id='bypassCachePhotos'
              checked={bypassCache}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBypassCache(e.target.checked)
              }
              className='h-4 w-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-700'
            />
            <label
              htmlFor='bypassCachePhotos'
              className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono'
            >
              Bypass Cache
            </label>
          </div>
        </HackerCardContent>

        <HackerCardFooter>
          <HackerButton
            onClick={() => photoQuery.refetch()}
            disabled={photoQuery.isLoading || !photoId}
            className='w-full'
          >
            {photoQuery.isLoading ? '[LOADING...]' : '[EXECUTE_PHOTO_QUERY]'}
          </HackerButton>
        </HackerCardFooter>
      </HackerCard>

      <HackerCard>
        <HackerCardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>
              <HackerTitle>photo_result</HackerTitle>
            </CardTitle>
            <ResetButton onClick={handleReset} />
          </div>
          <CardDescription className='flex items-center justify-between text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            <span>Photo API response will appear here</span>
            <div className='flex items-center space-x-3'>
              <input
                type='checkbox'
                id='show-raw-json-photo'
                checked={showRawJson}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setShowRawJson(e.target.checked)
                }
                className='h-4 w-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-700'
              />
              <Label
                htmlFor='show-raw-json-photo'
                className='text-xs text-cyan-400 dark:text-cyan-400 font-mono'
              >
                Show Raw JSON
              </Label>
            </div>
          </CardDescription>
        </HackerCardHeader>

        <HackerCardContent>
          <div className='flex justify-between items-center mb-4'>
            {/* Display the request URL */}
            {photoQuery.data ? (
              <RequestUrlDisplay url={getRequestUrl()} />
            ) : (
              <div className='flex-1'></div>
            )}
            <HackerButton
              onClick={handleClearPhotos}
              disabled={!photoQuery.data}
              className='text-xs ml-2'
            >
              [CLEAR]
            </HackerButton>
          </div>

          {photoQuery.isError && (
            <div className='p-4 mb-5 bg-zinc-950 dark:bg-zinc-950 border border-red-700 text-red-400 dark:text-red-400 rounded-sm font-mono shadow-[0_0_10px_rgba(248,113,113,0.2)]'>
              <p className='font-bold'>[ERROR]</p>
              <p>{photoQuery.error?.message || 'Unknown error occurred'}</p>
            </div>
          )}

          <div className='min-h-[400px]'>
            {photoQuery.isLoading ? (
              <LoadingSpinner />
            ) : photoQuery.data ? (
              <>
                {showRawJson ? (
                  <JsonDisplay data={photoQuery.data} />
                ) : (
                  <div className='space-y-5 text-cyan-400 dark:text-cyan-400 font-mono'>
                    {/* Cache information */}
                    <div className='flex justify-between'>
                      <span className='font-medium'>Cache Hit:</span>
                      <span>{photoQuery.data.cacheHit ? 'Yes' : 'No'}</span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='font-medium'>Total Photos:</span>
                      <span>{photoQuery.data.count}</span>
                    </div>

                    {/* Photo thumbnails */}
                    {photoQuery.data.data &&
                      photoQuery.data.data.length > 0 && (
                        <div className='space-y-3'>
                          <p className='font-medium'>Photos:</p>
                          <div className='grid grid-cols-3 gap-2'>
                            {photoQuery.data.data.map((photoUrl, index) => {
                              console.log({ photoUrl });
                              return (
                                <div
                                  key={index}
                                  className='border rounded-sm overflow-hidden border-cyan-800 bg-zinc-950 dark:bg-zinc-950 shadow-[0_0_5px_rgba(6,182,212,0.15)] cursor-pointer hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-shadow'
                                  onClick={() => setSelectedPhotoIndex(index)}
                                >
                                  <Image
                                    src={photoUrl.toString()}
                                    alt={`Photo ${index + 1}`}
                                    width={200}
                                    height={96}
                                    unoptimized
                                    className='w-full h-24 object-cover'
                                  />
                                  <div className='text-xs p-1 text-center'>
                                    Photo {index + 1}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* Selected photo view */}
                    {selectedPhotoIndex !== null &&
                      photoQuery.data.data &&
                      photoQuery.data.data[selectedPhotoIndex] && (
                        <div className='mt-5 space-y-3'>
                          <div className='flex justify-between items-center'>
                            <p className='font-medium'>Selected Photo:</p>
                            <HackerButton
                              onClick={() => setSelectedPhotoIndex(null)}
                              className='text-xs'
                            >
                              [CLOSE]
                            </HackerButton>
                          </div>
                          <div className='border rounded-sm p-3 overflow-hidden border-cyan-800 bg-zinc-950 dark:bg-zinc-950 shadow-[0_0_15px_rgba(6,182,212,0.2)]'>
                            <Image
                              src={photoQuery.data.data[
                                selectedPhotoIndex
                              ].toString()}
                              alt={`Selected photo ${selectedPhotoIndex + 1}`}
                              width={800}
                              height={600}
                              unoptimized
                              className='w-full h-auto object-contain max-h-96'
                            />
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </>
            ) : (
              !photoQuery.isError && (
                <p className='text-cyan-700 dark:text-cyan-700 text-center py-8 font-mono'>
                  $ Enter a photo ID and click [EXECUTE_PHOTO_QUERY] to see
                  results <span className='animate-pulse'>_</span>
                </p>
              )
            )}
          </div>
        </HackerCardContent>
      </HackerCard>
    </div>
  );
};

// Main page component that handles feature flag check
export default function AppPage() {
  const router = useRouter();
  const IS_APP_ENABLED = useGateValue(FEATURE_FLAGS.ENABLE_APP);
  const queryClient = useQueryClient();

  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [textQuery, setTextQuery] = useState(DEFAULT_TEXT_QUERY);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [bypassCache, setBypassCache] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Individual raw JSON toggles for each section
  const [showRawJsonNearby, setShowRawJsonNearby] = useState(false);
  const [showRawJsonDetails, setShowRawJsonDetails] = useState(false);
  const [showRawJsonPhoto, setShowRawJsonPhoto] = useState(false);
  const [showAllRawJson, setShowAllRawJson] = useState(false);

  // Photo API state
  const [photoId, setPhotoId] = useState(DEFAULT_PHOTO_ID);
  const [bypassCachePhotos, setBypassCachePhotos] = useState(false);

  // Details API state
  const [placeId, setPlaceId] = useState(DEFAULT_PLACE_ID);
  const [bypassCacheDetails, setBypassCacheDetails] = useState(false);

  // Use useEffect for navigation to avoid "location is not defined" error
  useEffect(() => {
    if (!IS_APP_ENABLED) {
      router.push('/');
    }
  }, [IS_APP_ENABLED, router]);

  // Function to toggle all raw JSON views at once
  const handleToggleAllRawJson = (checked: boolean) => {
    setShowAllRawJson(checked);
    setShowRawJsonNearby(checked);
    setShowRawJsonDetails(checked);
    setShowRawJsonPhoto(checked);
  };

  // TanStack Query for nearby places
  const nearbyPlacesQuery = useQuery({
    queryKey: [
      'nearbyPlaces',
      location,
      textQuery,
      limit,
      bypassCache,
      openNow,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        location,
        textQuery,
        limit: limit.toString(),
      });

      // Add optional parameters
      if (bypassCache) {
        params.append('bypassCache', 'true');
      }

      if (openNow) {
        params.append('openNow', 'true');
      }

      // Add version parameter to test the v2 API
      params.append('version', 'v2');

      try {
        const response = await fetch(`/api/places/nearby?${params.toString()}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API returned ${response.status}: ${response.statusText}. ${errorText}`
          );
        }

        return response.json() as Promise<EnhancedPlacesResponse>;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Nearby places query failed: ${errorMessage}`);
        throw error;
      }
    },
    enabled: false, // Don't run automatically on mount or when params change
    retry: 1,
  });

  // TanStack Query for place details
  const placeDetailsQuery = useQuery({
    queryKey: ['placeDetails', placeId, bypassCacheDetails],
    queryFn: async () => {
      if (!placeId) {
        toast.error('Place ID is required');
        throw new Error('ID is required');
      }

      const params = new URLSearchParams({
        id: placeId,
      });

      if (bypassCacheDetails) {
        params.append('bypassCache', 'true');
      }

      try {
        const response = await fetch(
          `/api/places/details?${params.toString()}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API returned ${response.status}: ${response.statusText}. ${errorText}`
          );
        }

        return response.json() as Promise<EnhancedDetailResponse>;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Place details query failed: ${errorMessage}`);
        throw error;
      }
    },
    enabled: false, // Don't run automatically on mount or when placeId changes
    retry: 1,
  });

  // TanStack Query for photos
  const photoQuery = useQuery({
    queryKey: ['photo', photoId, bypassCachePhotos],
    queryFn: async () => {
      if (!photoId) {
        toast.error('Photo ID is required');
        throw new Error('Photo ID is required');
      }

      const params = new URLSearchParams({
        id: photoId,
      });

      if (bypassCachePhotos) {
        params.append('bypassCache', 'true');
      }

      try {
        const response = await fetch(`/api/places/photos?${params.toString()}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API returned ${response.status}: ${response.statusText}. ${errorText}`
          );
        }

        return response.json() as Promise<PhotosResponse>;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Photo query failed: ${errorMessage}`);
        throw error;
      }
    },
    enabled: false, // Don't run automatically on mount or when photoId changes
    retry: 1,
  });

  // Function to clear nearby places query data
  const handleClearNearbyPlaces = () => {
    queryClient.removeQueries({ queryKey: ['nearbyPlaces'] });
    toast.success('Nearby places results cleared');
  };

  // Function to clear place details query data
  const handleClearPlaceDetails = () => {
    queryClient.removeQueries({ queryKey: ['placeDetails'] });
    setPlaceId(DEFAULT_PLACE_ID);
    toast.success('Place details results cleared');
  };

  // Function to clear photo query data
  const handleClearPhotos = () => {
    queryClient.removeQueries({ queryKey: ['photo'] });
    setPhotoId(DEFAULT_PHOTO_ID);
    toast.success('Photo results cleared');
  };

  // Function to set place ID and immediately fetch details
  const handleGetDetails = (id: string) => {
    setPlaceId(id);
    // Use setTimeout with 0 delay to ensure the state is updated before refetching
    setTimeout(() => {
      toast.info(`Fetching details for place ID: ${id}`);
      placeDetailsQuery.refetch();
    }, 0);
  };

  // Function to set photo ID and immediately fetch photos
  const handleGetPhotos = (id: string) => {
    setPhotoId(id);
    // Use setTimeout with 0 delay to ensure the state is updated before refetching
    setTimeout(() => {
      toast.info(`Fetching photos for place ID: ${id}`);
      photoQuery.refetch();
    }, 0);
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser';
      setLocationError(errorMsg);
      toast.error(errorMsg);
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Format to 4 decimal places for consistency
        const formattedLat = latitude.toFixed(4);
        const formattedLng = longitude.toFixed(4);
        const locationString = `${formattedLat},${formattedLng}`;
        setLocation(locationString);
        toast.success(`Location set to: ${locationString}`);
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unknown error occurred while getting location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setLocationError(errorMessage);
        toast.error(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (!IS_APP_ENABLED) {
    return null; // Return null while the redirect happens in useEffect
  }

  return (
    <div className='flex flex-col p-6'>
      <div className='flex justify-between items-center mb-6 border-b border-cyan-400 dark:border-cyan-800 pb-4'>
        <h1 className='text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center'>
          <span className='mr-2 text-cyan-400'>$</span>
          <span>API_DEBUG_TOOLS</span>
          <span className='ml-2 animate-pulse text-purple-500'>_</span>
        </h1>
        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='show-all-raw-json'
            checked={showAllRawJson}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleToggleAllRawJson(e.target.checked)
            }
            className='h-4 w-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-700'
          />
          <Label htmlFor='show-all-raw-json' className='text-cyan-400'>
            Show All Raw JSON
          </Label>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        {/* Nearby Places API Section */}
        <ErrorBoundary title='Nearby Places API Error'>
          <NearbyPlacesSection
            location={location}
            setLocation={setLocation}
            textQuery={textQuery}
            setTextQuery={setTextQuery}
            limit={limit}
            setLimit={setLimit}
            bypassCache={bypassCache}
            setBypassCache={setBypassCache}
            openNow={openNow}
            setOpenNow={setOpenNow}
            gettingLocation={gettingLocation}
            locationError={locationError}
            getCurrentLocation={getCurrentLocation}
            showRawJson={showRawJsonNearby}
            setShowRawJson={setShowRawJsonNearby}
            nearbyPlacesQuery={nearbyPlacesQuery}
            handleGetDetails={handleGetDetails}
            handleGetPhotos={handleGetPhotos}
            handleClearNearbyPlaces={handleClearNearbyPlaces}
          />
        </ErrorBoundary>

        {/* Place Details API Section */}
        <ErrorBoundary title='Place Details API Error'>
          <PlaceDetailsSection
            placeId={placeId}
            setPlaceId={setPlaceId}
            showRawJson={showRawJsonDetails}
            setShowRawJson={setShowRawJsonDetails}
            placeDetailsQuery={placeDetailsQuery}
            bypassCache={bypassCacheDetails}
            setBypassCache={setBypassCacheDetails}
            handleClearPlaceDetails={handleClearPlaceDetails}
          />
        </ErrorBoundary>

        {/* Photos API Section */}
        <ErrorBoundary title='Photos API Error'>
          <PhotosSection
            photoId={photoId}
            setPhotoId={setPhotoId}
            showRawJson={showRawJsonPhoto}
            setShowRawJson={setShowRawJsonPhoto}
            photoQuery={photoQuery}
            bypassCache={bypassCachePhotos}
            setBypassCache={setBypassCachePhotos}
            handleClearPhotos={handleClearPhotos}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
