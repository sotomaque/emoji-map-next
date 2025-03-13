'use client';

import React from 'react';
import {
  HackerCard,
  HackerCardHeader,
  HackerTitle,
} from '../server-ui-components';
import {
  HackerCardContent,
  HackerCardFooter,
  HackerInput,
  HackerButton,
  ResetButton,
  JsonDisplay,
  RequestUrlDisplay,
  LoadingSpinner,
} from '../ui-components';
import type { PlaceDetailsSectionProps } from '../types';

// This is the main component that combines server and client parts
const PlaceDetailsSection: React.FC<PlaceDetailsSectionProps> = (props) => {
  // Construct the request URL for display
  const getRequestUrl = () => {
    const params = new URLSearchParams({
      id: props.placeId,
    });

    // Add bypassCache parameter if needed
    if (props.bypassCache) {
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
      // Handle objects with a text property
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

  // Render editorial summary safely
  const renderEditorialSummary = () => {
    const summary = props.placeDetailsQuery.data?.data?.editorialSummary;
    if (!summary) return null;

    let summaryText = '';

    // Handle string case
    if (typeof summary === 'string') {
      summaryText = summary;
    }
    // Handle object with text property
    else if (
      typeof summary === 'object' &&
      summary !== null &&
      'text' in summary
    ) {
      const typedSummary = summary as { text: unknown };
      summaryText =
        typeof typedSummary.text === 'string'
          ? typedSummary.text
          : JSON.stringify(typedSummary.text);
    }
    // Fallback
    else {
      try {
        summaryText = JSON.stringify(summary);
      } catch {
        summaryText = 'Unable to display editorial summary';
      }
    }

    return (
      <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
        <p className='text-sm font-medium mb-2 text-cyan-400'>
          Editorial Summary:
        </p>
        <p className='text-sm text-cyan-300'>{summaryText}</p>
      </div>
    );
  };

  // Render generative summary safely
  const renderGenerativeSummary = () => {
    const summary = props.placeDetailsQuery.data?.data?.generativeSummary;
    if (!summary) return null;

    let summaryText = '';

    // Handle string case
    if (typeof summary === 'string') {
      summaryText = summary;
    }
    // Handle object with overview property
    else if (
      typeof summary === 'object' &&
      summary !== null &&
      'overview' in summary
    ) {
      const typedSummary = summary as { overview: unknown };
      const overview = typedSummary.overview;

      if (
        typeof overview === 'object' &&
        overview !== null &&
        'text' in overview
      ) {
        const typedOverview = overview as { text: unknown };
        summaryText =
          typeof typedOverview.text === 'string'
            ? typedOverview.text
            : JSON.stringify(typedOverview.text);
      } else {
        summaryText = JSON.stringify(overview);
      }
    }
    // Fallback
    else {
      try {
        summaryText = JSON.stringify(summary);
      } catch {
        summaryText = 'Unable to display generative summary';
      }
    }

    return (
      <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
        <p className='text-sm font-medium mb-2 text-cyan-400'>
          Generative Summary:
        </p>
        <p className='text-sm text-cyan-300'>{summaryText}</p>
      </div>
    );
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
      {/* Form Card */}
      <HackerCard>
        <HackerCardHeader>
          <HackerTitle>place_details_api</HackerTitle>
          <div className='text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            Test the /api/places/details endpoint with a place ID
          </div>
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
              value={props.placeId}
              onChange={(e) => props.setPlaceId(e.target.value)}
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
              checked={props.bypassCache}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                props.setBypassCache(e.target.checked)
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
            onClick={() => props.placeDetailsQuery.refetch()}
            disabled={props.placeDetailsQuery.isLoading || !props.placeId}
            className='w-full'
          >
            {props.placeDetailsQuery.isLoading
              ? '[LOADING...]'
              : '[EXECUTE_PLACE_DETAILS_QUERY]'}
          </HackerButton>
        </HackerCardFooter>
      </HackerCard>

      {/* Results Card */}
      <HackerCard>
        <HackerCardHeader>
          <div className='flex justify-between items-center'>
            <HackerTitle>place_details_result</HackerTitle>
            <ResetButton
              onClick={() => {
                props.setPlaceId('');
                props.setBypassCache(false);
                props.setShowRawJson(false);
                props.handleClearPlaceDetails();
              }}
            />
          </div>
          <div className='flex items-center justify-between text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            <span>Place details API response will appear here</span>
            <div className='flex items-center space-x-3'>
              <input
                type='checkbox'
                id='show-raw-json-details'
                checked={props.showRawJson}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  props.setShowRawJson(e.target.checked)
                }
                className='h-4 w-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-700'
              />
              <label
                htmlFor='show-raw-json-details'
                className='text-xs text-cyan-400 dark:text-cyan-400 font-mono'
              >
                Show Raw JSON
              </label>
            </div>
          </div>
        </HackerCardHeader>

        <HackerCardContent>
          <div className='flex justify-between items-center mb-4'>
            {/* Display the request URL */}
            {props.placeDetailsQuery.data ? (
              <RequestUrlDisplay url={getRequestUrl()} />
            ) : (
              <div className='flex-1'></div>
            )}
            <HackerButton
              onClick={props.handleClearPlaceDetails}
              disabled={!props.placeDetailsQuery.data}
              className='text-xs ml-2'
            >
              [CLEAR]
            </HackerButton>
          </div>

          {props.placeDetailsQuery.isError && (
            <div className='p-4 mb-5 bg-zinc-950 dark:bg-zinc-950 border border-red-700 text-red-400 dark:text-red-400 rounded-sm font-mono shadow-[0_0_10px_rgba(248,113,113,0.2)]'>
              <p className='font-bold'>[ERROR]</p>
              <p>
                {props.placeDetailsQuery.error?.message ||
                  'Unknown error occurred'}
              </p>
            </div>
          )}

          <div className='min-h-[400px]'>
            {props.placeDetailsQuery.isLoading ? (
              <LoadingSpinner />
            ) : props.placeDetailsQuery.data ? (
              <>
                {props.showRawJson ? (
                  <JsonDisplay data={props.placeDetailsQuery.data} />
                ) : (
                  <div className='space-y-5 max-h-96 overflow-y-auto text-cyan-400 dark:text-cyan-400 font-mono'>
                    {/* API Response Metadata */}
                    <div className='p-3 border border-purple-800 rounded-sm bg-zinc-950 mb-4'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='font-medium text-purple-400'>
                          Cache Hit:
                        </span>
                        <span className='text-purple-300'>
                          {props.placeDetailsQuery.data.cacheHit ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium text-purple-400'>
                          Count:
                        </span>
                        <span className='text-purple-300'>
                          {props.placeDetailsQuery.data.count}
                        </span>
                      </div>
                    </div>

                    {/* Place details */}
                    {props.placeDetailsQuery.data.data && (
                      <div className='space-y-3 mt-4'>
                        {/* Name */}
                        <h3 className='text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500'>
                          {props.placeDetailsQuery.data.data.name ||
                            'Name not available'}
                        </h3>

                        <div className='p-3 border border-cyan-800 rounded-sm bg-zinc-950'>
                          <div className='space-y-1'>
                            {renderDetailField(
                              'Name',
                              props.placeDetailsQuery.data.data.name
                            )}
                            {renderDetailField(
                              'Primary Type',
                              props.placeDetailsQuery.data.data
                                .primaryTypeDisplayName
                            )}
                            {renderDetailField(
                              'Rating',
                              props.placeDetailsQuery.data.data.rating
                            )}
                            {renderDetailField(
                              'Price Level',
                              props.placeDetailsQuery.data.data.priceLevel
                            )}
                            {renderDetailField(
                              'User Rating Count',
                              props.placeDetailsQuery.data.data.userRatingCount
                            )}
                            {renderDetailField(
                              'Currently Open',
                              props.placeDetailsQuery.data.data.openNow
                            )}
                          </div>
                        </div>

                        {/* Editorial Summary */}
                        {renderEditorialSummary()}

                        {/* Generative Summary */}
                        {renderGenerativeSummary()}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              !props.placeDetailsQuery.isError && (
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
