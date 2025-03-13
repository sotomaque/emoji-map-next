'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
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
import type { PhotosSectionProps } from './types';

const PhotosSection: React.FC<PhotosSectionProps> = ({
  photoId,
  setPhotoId,
  showRawJson,
  setShowRawJson,
  photoQuery,
  bypassCache,
  setBypassCache,
  handleClearPhotos,
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
    setPhotoId('');
    setBypassCache(false);
    setShowRawJson(false);
    setSelectedPhotoIndex(null);
    handleClearPhotos(); // Clear the query data
    toast.success('Photos form reset');
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
      <HackerCard>
        <HackerCardHeader>
          <HackerTitle>photos_api</HackerTitle>
          <div className='text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            Test the /api/places/photos endpoint with a photo ID
          </div>
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
            <HackerTitle>photo_result</HackerTitle>
            <ResetButton onClick={handleReset} />
          </div>
          <div className='flex items-center justify-between text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
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
          </div>
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
                            {photoQuery.data.data.map((photoUrl, index) => (
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
                            ))}
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

export default PhotosSection;
