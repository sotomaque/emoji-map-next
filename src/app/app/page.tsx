'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGateValue } from '@statsig/react-bindings';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import NearbyPlacesSection from '@/app/app/components/nearby-places-section';
import PhotosSection from '@/app/app/components/photos-section';
import PlaceDetailsSection from '@/app/app/components/place-details-section';
import {
  DEFAULT_LOCATION,
  DEFAULT_LIMIT,
  DEFAULT_PHOTO_ID,
  DEFAULT_PLACE_ID,
} from '@/app/app/components/types';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Label } from '@/components/ui/label';
import { FEATURE_FLAGS } from '@/constants/feature-flags';
import type { DetailResponse } from '@/types/details';
import type { PhotosResponse } from '@/types/google-photos';
import type { PlacesResponse } from '@/types/places';

// Main page component that handles feature flag check
export default function AppPage() {
  const router = useRouter();
  const IS_APP_ENABLED = useGateValue(FEATURE_FLAGS.ENABLE_APP);
  const queryClient = useQueryClient();

  // Refs for scrolling to sections
  const placeDetailsRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);

  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [keysQuery, setKeysQuery] = useState('1|2');
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
      keysQuery,
      limit,
      bypassCache,
      openNow,
    ],
    queryFn: async () => {
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

      // Add optional parameters
      if (bypassCache) {
        params.append('bypassCache', 'true');
      }

      if (openNow) {
        params.append('openNow', 'true');
      }

      try {
        console.log({
          locationURL: `/api/places/nearby?${params.toString()}`,
        });
        const response = await fetch(`/api/places/nearby?${params.toString()}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API returned ${response.status}: ${response.statusText}. ${errorText}`
          );
        }

        return response.json() as Promise<PlacesResponse>;
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

        return response.json() as Promise<DetailResponse>;
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
    queryClient.resetQueries({ queryKey: ['nearbyPlaces'] });
    toast.success('Nearby places results cleared');
  };

  // Function to clear place details query data
  const handleClearPlaceDetails = () => {
    queryClient.resetQueries({ queryKey: ['placeDetails'] });
    setPlaceId(DEFAULT_PLACE_ID);
    toast.success('Place details results cleared');
  };

  // Function to clear photo query data
  const handleClearPhotos = () => {
    queryClient.resetQueries({ queryKey: ['photo'] });
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

      // Scroll to the details section with a small delay to ensure rendering
      setTimeout(() => {
        if (placeDetailsRef.current) {
          placeDetailsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }, 0);
  };

  // Function to set photo ID and immediately fetch photos
  const handleGetPhotos = (id: string) => {
    setPhotoId(id);
    // Use setTimeout with 0 delay to ensure the state is updated before refetching
    setTimeout(() => {
      toast.info(`Fetching photos for place ID: ${id}`);
      photoQuery.refetch();

      // Scroll to the photos section with a small delay to ensure rendering
      setTimeout(() => {
        if (photosRef.current) {
          photosRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
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
        <div>
          <Link
            href='/app/profile'
            className='text-cyan-400 hover:text-cyan-300 transition-colors font-medium flex items-center'
          >
            <span>View Profile</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 ml-1'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </Link>
        </div>
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
            keysQuery={keysQuery}
            setKeysQuery={setKeysQuery}
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
        <div ref={placeDetailsRef}>
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
        </div>

        {/* Photos API Section */}
        <div ref={photosRef}>
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
    </div>
  );
}
