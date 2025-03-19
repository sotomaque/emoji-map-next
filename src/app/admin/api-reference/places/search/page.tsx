'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORY_MAP } from '@/constants/category-map';
import type { PlacesResponse, Place } from '@/types/places';

const DEFAULT_LOCATION = '40.7128,-74.0060';

// Form schema for place search
const searchFormSchema = z.object({
  location: z.string().min(3, {
    message: "Location must be in the format 'latitude,longitude'",
  }),
  limit: z.coerce.number().int().min(1).max(50),
  bypassCache: z.boolean().default(false),
  openNow: z.boolean().default(false),
  showRawJson: z.boolean().default(false),
});

// Type inference for our form values
type SearchFormValues = z.infer<typeof searchFormSchema>;

// Add the PlaceCardSkeleton component
const PlaceCardSkeleton = () => {
  return (
    <div className='p-4 border rounded-md bg-muted'>
      <div className='flex justify-between'>
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-6' /> {/* Emoji placeholder */}
            <Skeleton className='h-5 w-24' /> {/* ID placeholder */}
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-16' />{' '}
              {/* Location label placeholder */}
              <Skeleton className='h-4 w-32' /> {/* Coordinates placeholder */}
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-8 w-16' /> {/* Copy ID button placeholder */}
          <Skeleton className='h-8 w-20' />{' '}
          {/* View Details button placeholder */}
        </div>
      </div>
    </div>
  );
};

export default function PlacesSearchPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // State for fields that aren't directly in the form schema
  const [selectedCategories, setSelectedCategories] = useState<number[]>([
    1, 2,
  ]); // Default categories
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<number[]>([]);
  const [minimumRating, setMinimumRating] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formattedResults, setFormattedResults] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{
    url: string;
    body: string;
  } | null>(null);
  const [isRequestDetailsExpanded, setIsRequestDetailsExpanded] =
    useState(false);

  // Initialize form with default values
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      location: DEFAULT_LOCATION,
      limit: 20,
      bypassCache: false,
      openNow: false,
      showRawJson: false,
    },
  });

  // Watch form values for the query
  const location = form.watch('location');
  const limit = form.watch('limit');
  const bypassCache = form.watch('bypassCache');
  const openNow = form.watch('openNow');
  const showRawJson = form.watch('showRawJson');

  // Create a keysQuery string from selected categories
  const keysQuery = selectedCategories.sort((a, b) => a - b).join('|');

  // TanStack Query for nearby places
  const searchPlacesQuery = useQuery({
    queryKey: [
      'nearbyPlaces',
      location,
      keysQuery,
      limit,
      bypassCache,
      openNow,
      selectedPriceLevels,
      minimumRating,
    ],
    queryFn: async () => {
      // Parse location string into latitude and longitude
      const [latitude, longitude] = location.split(',').map(Number);

      // Parse keys from the keysQuery string
      const keys = keysQuery
        ? keysQuery
            .split('|')
            .map((k) => Number(k.trim()))
            .filter(Boolean)
        : undefined;

      // Prepare request body for the search endpoint
      const requestBody = {
        location: {
          latitude,
          longitude,
        },
        keys,
        openNow: openNow || undefined,
        bypassCache,
        // Include price levels if any are selected
        ...(selectedPriceLevels.length > 0 && {
          priceLevels: selectedPriceLevels,
        }),
        // Use limit as maxResultCount if provided
        ...(limit && { maxResultCount: Number(limit) }),
        // Include minimumRating if provided
        ...(minimumRating !== null && { minimumRating }),
      };

      // Store the request details for debugging
      setLastRequest({
        url: '/api/places/search',
        body: JSON.stringify(requestBody, null, 2),
      });

      try {
        const response = await fetch('/api/places/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API returned ${response.status}: ${response.statusText}. ${errorText}`
          );
        }

        const searchResponse = await response.json();

        // Transform the search response to match the expected PlacesResponse format
        const placesResponse: PlacesResponse = {
          data: searchResponse.results || [],
          count: searchResponse.count || 0,
          cacheHit: searchResponse.cacheHit || false,
        };

        // Format results for display if needed
        if (showRawJson) {
          setFormattedResults(JSON.stringify(placesResponse, null, 2));
        } else {
          setFormattedResults(null);
        }

        return placesResponse;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Places search query failed: ${errorMessage}`);
        throw error;
      }
    },
    enabled: false, // Don't run automatically on mount or when params change
    retry: 1,
  });

  // Toggle a category in the selectedCategories
  const toggleCategory = (key: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key].sort((a, b) => a - b);
      }
    });
  };

  // Toggle a price level
  const togglePriceLevel = (level: number) => {
    setSelectedPriceLevels((prev) => {
      if (prev.includes(level)) {
        return prev.filter((l) => l !== level);
      } else {
        return [...prev, level].sort((a, b) => a - b);
      }
    });
  };

  // Get current location from browser
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

        // Update the form with the new location
        form.setValue('location', locationString);

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

  // Helper function to get price level symbol
  const getPriceLevelSymbol = (level: number) => {
    return '$'.repeat(level);
  };

  // Reset form and query states
  const handleReset = () => {
    form.reset({
      location: DEFAULT_LOCATION,
      limit: 20,
      bypassCache: false,
      openNow: false,
      showRawJson: false,
    });
    setSelectedCategories([1, 2]);
    setSelectedPriceLevels([]);
    setMinimumRating(null);
    setLocationError(null);
    setLastRequest(null);
    queryClient.resetQueries({ queryKey: ['nearbyPlaces'] });
    toast.success('Form has been reset');
  };

  // Form submit handler
  const onSubmit = () => {
    // Refetch with current form values
    searchPlacesQuery.refetch();
  };

  // Helper for rendering place cards
  const renderPlaceCard = (place: Place) => {
    return (
      <div
        key={place.id}
        className='p-4 border rounded-md bg-muted transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:bg-muted/80'
      >
        <div className='flex justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='text-xl'>{place.emoji}</span>
              <span className='font-medium'>ID: {place.id}</span>
            </div>
            <div className='text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>Location:</span>
                <span>
                  {place.location?.latitude.toFixed(4)},{' '}
                  {place.location?.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                navigator.clipboard
                  .writeText(place.id)
                  .then(() => toast.success('Place ID copied to clipboard'))
                  .catch(() => toast.error('Failed to copy to clipboard'));
              }}
            >
              Copy ID
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                router.push(
                  `/admin/api-reference/places/details?id=${place.id}`
                );
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='flex flex-col gap-8 p-4'>
      {/* Title + Description */}
      <div>
        <h1 className='text-2xl font-bold'>Places Search</h1>
        <p className='text-sm text-muted-foreground'>
          Search for places near a specific location using selected categories.
        </p>
      </div>

      {/* Search Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
          <CardDescription>Configure your places search</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Location Field */}
                <div className='flex flex-col space-y-1.5'>
                  <div className='flex justify-between items-center'>
                    <FormLabel htmlFor='location'>Location</FormLabel>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                    >
                      {gettingLocation
                        ? 'Getting location...'
                        : 'Use Current Location'}
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name='location'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder='40.7128,-74.0060' {...field} />
                        </FormControl>
                        {locationError && (
                          <p className='text-sm text-destructive'>
                            {locationError}
                          </p>
                        )}
                        <FormDescription>
                          Format: latitude,longitude
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Limit Field */}
                <FormField
                  control={form.control}
                  name='limit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Result Limit</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of results to return
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category Selection */}
              <div className='space-y-3'>
                <FormLabel>Categories</FormLabel>
                <FormDescription>
                  Select categories to search for
                </FormDescription>
                <div className='flex flex-wrap gap-2'>
                  {CATEGORY_MAP.map((category) => (
                    <button
                      key={category.key}
                      type='button'
                      onClick={() => toggleCategory(category.key)}
                      className={`px-3 py-2 rounded-full text-sm flex items-center transition-colors hover:scale-105 ${
                        selectedCategories.includes(category.key)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      title={`${category.name} (key: ${category.key})`}
                    >
                      <span className='mr-1 text-lg'>{category.emoji}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
                {selectedCategories.length === 0 && (
                  <p className='text-sm text-muted-foreground'>
                    All categories will be used if none are selected
                  </p>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Price Levels */}
                <div className='space-y-3'>
                  <FormLabel>Price Levels</FormLabel>
                  <FormDescription>Filter by price level</FormDescription>
                  <div className='flex flex-wrap gap-2'>
                    {[1, 2, 3, 4].map((level) => (
                      <button
                        key={`price-level-${level}`}
                        type='button'
                        onClick={() => togglePriceLevel(level)}
                        className={`px-3 py-2 rounded-full text-sm flex items-center transition-colors hover:scale-105 ${
                          selectedPriceLevels.includes(level)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={`Price Level ${level}`}
                      >
                        {getPriceLevelSymbol(level)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimum Rating */}
                <div className='space-y-3'>
                  <FormLabel>Minimum Rating</FormLabel>
                  <FormDescription>Filter by minimum rating</FormDescription>
                  <div className='flex items-center gap-3'>
                    <div className='flex'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={`star-${star}`}
                          type='button'
                          onClick={() =>
                            setMinimumRating(
                              star === minimumRating ? null : star
                            )
                          }
                          className='focus:outline-none transition-transform hover:scale-110'
                          title={`Set minimum rating to ${star}`}
                        >
                          <span
                            className={`text-2xl ${
                              minimumRating !== null && star <= minimumRating
                                ? 'text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          >
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    {minimumRating !== null && (
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>
                          {minimumRating}.0+
                        </span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => setMinimumRating(null)}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkboxes in a row */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='openNow'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Open Now</FormLabel>
                        <FormDescription>
                          Only show places that are currently open
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bypassCache'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Bypass Cache</FormLabel>
                        <FormDescription>
                          Force a fresh request to the API
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='showRawJson'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Show Raw JSON</FormLabel>
                        <FormDescription>
                          Display the raw API response
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex justify-between pt-2'>
                <Button type='button' variant='outline' onClick={handleReset}>
                  Reset
                </Button>
                <Button type='submit' disabled={searchPlacesQuery.isFetching}>
                  {searchPlacesQuery.isFetching
                    ? 'Searching...'
                    : 'Search Places'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            Places matching your search criteria
          </CardDescription>
        </CardHeader>
        <CardContent className='overflow-hidden'>
          {searchPlacesQuery.isError && (
            <div className='p-4 mb-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md'>
              <p className='font-bold'>Error</p>
              <p>
                {searchPlacesQuery.error?.message ||
                  'An unknown error occurred'}
              </p>
            </div>
          )}

          {/* Request Debug Information */}
          {lastRequest && (
            <div className='mb-4 border rounded-md overflow-hidden'>
              <div
                className='bg-slate-100 dark:bg-slate-800 px-4 py-2 flex justify-between items-center cursor-pointer'
                onClick={() =>
                  setIsRequestDetailsExpanded(!isRequestDetailsExpanded)
                }
              >
                <div className='flex items-center gap-2'>
                  <h3 className='text-sm font-medium'>Request Details</h3>
                  {isRequestDetailsExpanded ? (
                    <ChevronUpIcon className='h-4 w-4' />
                  ) : (
                    <ChevronDownIcon className='h-4 w-4' />
                  )}
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent toggling when copying
                    const fullRequestDetails = `URL: ${lastRequest.url}\nMethod: POST\nBody: ${lastRequest.body}`;
                    navigator.clipboard
                      .writeText(fullRequestDetails)
                      .then(() =>
                        toast.success('Request details copied to clipboard')
                      )
                      .catch(() =>
                        toast.error('Failed to copy request details')
                      );
                  }}
                >
                  Copy All
                </Button>
              </div>

              {isRequestDetailsExpanded && (
                <>
                  <div className='p-3 border-b bg-muted/30'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <span className='font-medium text-sm'>Endpoint:</span>
                        <code className='ml-2 text-sm bg-muted px-1 py-0.5 rounded'>
                          {lastRequest.url}
                        </code>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent toggling when copying
                          navigator.clipboard
                            .writeText(lastRequest.url)
                            .then(() =>
                              toast.success('URL copied to clipboard')
                            )
                            .catch(() => toast.error('Failed to copy URL'));
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className='p-3'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='font-medium text-sm'>Request Body:</span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent toggling when copying
                          navigator.clipboard
                            .writeText(lastRequest.body)
                            .then(() =>
                              toast.success('Request body copied to clipboard')
                            )
                            .catch(() =>
                              toast.error('Failed to copy request body')
                            );
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <div className='bg-muted p-2 rounded overflow-auto max-h-[200px]'>
                      <pre className='text-xs whitespace-pre-wrap'>
                        {lastRequest.body}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className='min-h-[400px]'>
            {searchPlacesQuery.isFetching ? (
              <div className='space-y-4'>
                <div className='p-3 border rounded-md mb-4 bg-muted/30'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-medium'>Cache Hit:</span>
                    <Skeleton className='h-4 w-10' />
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium'>Total Places:</span>
                    <Skeleton className='h-4 w-8' />
                  </div>
                </div>

                <Separator className='my-4' />

                <h3 className='text-lg font-semibold mb-3'>
                  Loading places...
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto'>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <PlaceCardSkeleton key={`skeleton-${index}`} />
                  ))}
                </div>
              </div>
            ) : searchPlacesQuery.data ? (
              <div className='flex flex-col'>
                {/* Cache info and result count */}
                <div className='p-3 border rounded-md mb-4 bg-muted/30'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-medium'>Cache Hit:</span>
                    <span>
                      {searchPlacesQuery.data.cacheHit ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium'>Total Places:</span>
                    <span>{searchPlacesQuery.data.count}</span>
                  </div>
                </div>

                <Separator className='my-4' />

                {/* Display results */}
                {showRawJson ? (
                  <div className='relative h-[400px] overflow-hidden'>
                    <div className='absolute inset-0 overflow-auto bg-muted p-4 rounded-md'>
                      <pre className='text-xs'>{formattedResults}</pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className='text-lg font-semibold mb-3'>
                      Places Found: {searchPlacesQuery.data.count}
                    </h3>
                    <div className='relative h-[400px] overflow-hidden'>
                      <div className='absolute inset-0 overflow-auto pr-1 border border-muted rounded-md'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 p-4'>
                          {searchPlacesQuery.data.data &&
                          searchPlacesQuery.data.data.length > 0 ? (
                            searchPlacesQuery.data.data.map((place) =>
                              renderPlaceCard(place)
                            )
                          ) : (
                            <p className='text-center py-4 text-muted-foreground'>
                              No places found
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-64 text-center'>
                <p className='text-muted-foreground'>
                  Enter search parameters and click &quot;Search Places&quot; to
                  see results
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
