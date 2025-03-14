'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { CATEGORY_MAP } from '@/constants/category-map';
import type { Place } from '@/types/places';
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
import type { NearbyPlacesSectionProps } from './types';

const NearbyPlacesSection: React.FC<NearbyPlacesSectionProps> = ({
  location,
  setLocation,
  keysQuery,
  setKeysQuery,
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
}) => {
  // State to track favorited places
  const [favoritedPlaces, setFavoritedPlaces] = useState<
    Record<string, boolean>
  >({});
  const [loadingFavorites, setLoadingFavorites] = useState<
    Record<string, boolean>
  >({});

  // Parse the keysQuery string into an array of numbers
  const selectedKeys = keysQuery
    ? keysQuery
        .split('|')
        .map((k) => parseInt(k.trim()))
        .filter((k) => !isNaN(k))
    : [];

  // Toggle a key in the keysQuery
  const toggleKey = (key: number) => {
    const currentKeys = [...selectedKeys];
    const keyIndex = currentKeys.indexOf(key);

    if (keyIndex >= 0) {
      // Remove the key if it's already selected
      currentKeys.splice(keyIndex, 1);
    } else {
      // Add the key if it's not selected
      currentKeys.push(key);
    }

    // Sort the keys for consistent display
    currentKeys.sort((a, b) => a - b);

    // Update the keysQuery string
    setKeysQuery(currentKeys.join('|'));
  };

  // Fetch favorites when places data changes
  useEffect(() => {
    if (
      nearbyPlacesQuery.data?.data &&
      nearbyPlacesQuery.data.data.length > 0
    ) {
      checkFavoriteStatus(nearbyPlacesQuery.data.data);
    }
  }, [nearbyPlacesQuery.data]);

  // Check favorite status for all places
  const checkFavoriteStatus = async (places: Place[]) => {
    for (const place of places) {
      try {
        const response = await fetch(`/api/places/favorite?id=${place.id}`);
        if (response.ok) {
          const data = await response.json();
          setFavoritedPlaces((prev) => ({
            ...prev,
            [place.id]: data.isFavorite,
          }));
        }
      } catch (error) {
        console.error(`Error checking favorite status for ${place.id}:`, error);
      }
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (placeId: string) => {
    setLoadingFavorites((prev) => ({ ...prev, [placeId]: true }));

    try {
      const response = await fetch('/api/places/favorite', {
        method: 'POST',
        body: JSON.stringify({ id: placeId }),
      });

      if (response.ok) {
        const data = await response.json();
        const newStatus = data.action === 'added';

        setFavoritedPlaces((prev) => ({
          ...prev,
          [placeId]: newStatus,
        }));

        toast.success(
          newStatus
            ? 'Place added to favorites'
            : 'Place removed from favorites'
        );
      } else {
        toast.error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setLoadingFavorites((prev) => ({ ...prev, [placeId]: false }));
    }
  };

  // Construct the request URL for display
  const getRequestUrl = () => {
    const params = new URLSearchParams();

    // Add location parameter
    params.append('location', location);

    // Add keys parameters for each key
    if (keysQuery) {
      const keys = keysQuery.split('|').map((k) => k.trim());
      keys.forEach((key) => {
        if (key) {
          params.append('keys', key);
        }
      });
    }

    // Add limit parameter
    params.append('limit', limit.toString());

    if (bypassCache) {
      params.append('bypassCache', 'true');
    }

    if (openNow) {
      params.append('openNow', 'true');
    }

    return `/api/places/nearby?${params.toString()}`;
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

  // Helper function to render a place card
  const renderPlaceCard = (place: Place) => {
    const isFavorited = favoritedPlaces[place.id] || false;
    const isLoading = loadingFavorites[place.id] || false;

    return (
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
              className={`text-xs w-full ${
                isFavorited ? 'text-red-400 border-red-800' : ''
              }`}
              onClick={() => toggleFavorite(place.id)}
              disabled={isLoading}
            >
              {isLoading
                ? '[PROCESSING...]'
                : isFavorited
                ? '[UNFAVORITE]'
                : '[FAVORITE]'}
            </HackerButton>
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
            <HackerButton
              className='text-xs w-full'
              onClick={() => copyToClipboard(place.id)}
            >
              [COPY_ID]
            </HackerButton>
          </div>
        </div>
      </li>
    );
  };

  // Function to reset the component state
  const handleReset = () => {
    setLocation('40.7128,-74.0060');
    setKeysQuery('1|2');
    setLimit(20);
    setBypassCache(false);
    setOpenNow(false);
    setShowRawJson(false);
    handleClearNearbyPlaces(); // Clear the query data
    toast.success('Nearby places form reset');
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <HackerCard>
        <HackerCardHeader>
          <div className='font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center space-x-2 text-lg mb-1'>
            <span className='text-cyan-400'>$</span>
            <span className='animate-pulse text-purple-500'>_</span>
            <span>nearby_places_api</span>
          </div>
          <div className='text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            Test the /api/places/nearby endpoint with custom parameters
          </div>
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
            <label className='text-sm font-medium text-cyan-400 dark:text-cyan-400 font-mono flex items-center'>
              Category Keys (click to toggle)
              <span className='ml-2 text-xs text-cyan-600 opacity-80'>
                (defaults to all if none selected)
              </span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {CATEGORY_MAP.map((category) => (
                <button
                  key={category.key}
                  onClick={() => toggleKey(category.key)}
                  className={`px-4 py-2 rounded-full text-sm font-mono flex items-center transition-colors ${
                    selectedKeys.includes(category.key)
                      ? 'bg-cyan-800 text-white border border-cyan-600 shadow-[0_0_8px_rgba(8,145,178,0.3)]'
                      : 'bg-zinc-900 text-cyan-400 border border-zinc-800 hover:bg-zinc-800'
                  }`}
                  title={`${category.name} (key: ${category.key})`}
                >
                  <span className='text-lg'>{category.emoji}</span>
                </button>
              ))}
            </div>
            {selectedKeys.length > 0 ? (
              <div className='text-xs text-cyan-600 font-mono mt-2 p-2 border border-cyan-900 bg-zinc-950 rounded-md'>
                <div className='mb-2'>
                  <span className='text-cyan-500 font-medium'>
                    Selected categories:
                  </span>{' '}
                  {selectedKeys.map((key, index) => {
                    const category = CATEGORY_MAP.find((c) => c.key === key);
                    return (
                      <span key={key} className='inline-flex items-center'>
                        {index > 0 && <span className='mx-1'>•</span>}
                        <span className='mr-1'>{category?.emoji}</span>
                        <span>{category?.name}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Keywords section */}
                <div className='mt-3 space-y-2'>
                  {selectedKeys.map((key) => {
                    const category = CATEGORY_MAP.find((c) => c.key === key);
                    if (!category) return null;

                    return (
                      <div
                        key={`keywords-${key}`}
                        className='pl-2 border-l-2 border-cyan-800'
                      >
                        <div className='flex items-center'>
                          <span className='mr-1'>{category.emoji}</span>
                          <span className='text-cyan-400'>{category.name}</span>
                        </div>
                        <div className='text-cyan-600 mt-1'>
                          With Keywords: [
                          {category.keywords.map((k) => `'${k}'`).join(', ')}]
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className='text-xs text-cyan-600 font-mono mt-2 p-2 border border-cyan-900 bg-zinc-950 rounded-md'>
                <span className='text-cyan-500 font-medium'>
                  All categories will be used
                </span>
              </div>
            )}
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
              onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
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
            <HackerTitle>results</HackerTitle>
            <ResetButton onClick={handleReset} />
          </div>
          <div className='flex items-center justify-between text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
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
          </div>
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

export default NearbyPlacesSection;
