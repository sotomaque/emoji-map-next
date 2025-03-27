'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
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
import type { PhotosResponse } from '@/types/google-photos';

// Form schema for photo search
const photosFormSchema = z.object({
  photoId: z.string().min(1, {
    message: 'Photo ID is required',
  }),
  bypassCache: z.boolean().default(false),
  showRawJson: z.boolean().default(false),
});

// Type inference for our form values
type PhotosFormValues = z.infer<typeof photosFormSchema>;

// Skeleton component for photos
const PhotosSkeleton = () => {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-3 gap-2'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className='border rounded-sm overflow-hidden border-muted bg-muted/30'
          >
            <Skeleton className='h-24 w-full' />
            <div className='p-1 text-center'>
              <Skeleton className='h-4 w-16 mx-auto' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Create a client component for the form
function PhotosForm() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  // State for request details debug information
  const [lastRequest, setLastRequest] = useState<{
    url: string;
    params: string;
  } | null>(null);
  const [isRequestDetailsExpanded, setIsRequestDetailsExpanded] =
    useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );

  // Initialize form with values from URL if available
  const form = useForm<PhotosFormValues>({
    resolver: zodResolver(photosFormSchema),
    defaultValues: {
      photoId: searchParams.get('id') || '',
      bypassCache: false,
      showRawJson: false,
    },
  });

  // Watch form values for the query
  const photoId = form.watch('photoId');
  const bypassCache = form.watch('bypassCache');
  const showRawJson = form.watch('showRawJson');

  // TanStack Query for photos
  const photoQuery = useQuery({
    queryKey: ['photos', photoId, bypassCache],
    queryFn: async () => {
      if (!photoId) {
        toast.error('Photo ID is required');
        throw new Error('Photo ID is required');
      }

      const params = new URLSearchParams({
        id: photoId,
      });

      if (bypassCache) {
        params.append('bypassCache', 'true');
      }

      // Store the request details for debugging
      setLastRequest({
        url: `/api/places/photos`,
        params: params.toString(),
      });

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

  // Function to clear photo query data
  const handleClearPhotos = () => {
    queryClient.resetQueries({ queryKey: ['photos'] });
    form.reset({ ...form.getValues(), photoId: '' });
    setLastRequest(null);
    setSelectedPhotoIndex(null);
    toast.success('Photos results cleared');
  };

  // Reset form and query states
  const handleReset = () => {
    form.reset({
      photoId: '',
      bypassCache: false,
      showRawJson: false,
    });
    setLastRequest(null);
    setSelectedPhotoIndex(null);
    queryClient.resetQueries({ queryKey: ['photos'] });
    toast.success('Form has been reset');
  };

  // Form submit handler
  const onSubmit = () => {
    // Refetch with current form values
    photoQuery.refetch();
  };

  // Go back to details page
  const handleBackToDetails = () => {
    if (photoId) {
      router.push(`/admin/api-reference/places/details?id=${photoId}`);
    } else {
      router.push(`/admin/api-reference/places/details`);
    }
  };

  return (
    <div className='flex flex-col gap-8 p-4'>
      {/* Search Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Photos Parameters</CardTitle>
          <CardDescription>Configure your place photos request</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 gap-6'>
                {/* Photo ID Field */}
                <FormField
                  control={form.control}
                  name='photoId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter a Google Places ID'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a valid Google Places ID to fetch photos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Checkboxes in a row */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                <div className='flex gap-2'>
                  <Button type='button' variant='outline' onClick={handleReset}>
                    Reset
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleBackToDetails}
                  >
                    Back to Details
                  </Button>
                </div>
                <Button type='submit' disabled={photoQuery.isFetching}>
                  {photoQuery.isFetching ? 'Loading...' : 'Get Photos'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle>Photos Results</CardTitle>
              <CardDescription>Place photos and metadata</CardDescription>
            </div>
            {photoQuery.data && (
              <Button variant='outline' size='sm' onClick={handleClearPhotos}>
                Clear Results
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='overflow-hidden'>
          {photoQuery.isError && (
            <div className='p-4 mb-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md'>
              <p className='font-bold'>Error</p>
              <p>{photoQuery.error?.message || 'An unknown error occurred'}</p>
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
                    const fullRequestDetails = `URL: ${lastRequest.url}?${lastRequest.params}\nMethod: GET`;
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
                <div className='p-3 border-b bg-muted/30'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <span className='font-medium text-sm'>Endpoint:</span>
                      <code className='ml-2 text-sm bg-muted px-1 py-0.5 rounded'>{`${lastRequest.url}?${lastRequest.params}`}</code>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent toggling when copying
                        navigator.clipboard
                          .writeText(`${lastRequest.url}?${lastRequest.params}`)
                          .then(() => toast.success('URL copied to clipboard'))
                          .catch(() => toast.error('Failed to copy URL'));
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className='min-h-[400px]'>
            {photoQuery.isFetching ? (
              <div className='space-y-4'>
                <div className='p-3 border rounded-md mb-4 bg-muted/30'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-medium'>Cache Hit:</span>
                    <Skeleton className='h-4 w-10' />
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium'>Total Photos:</span>
                    <Skeleton className='h-4 w-8' />
                  </div>
                </div>

                <Separator className='my-4' />

                <h3 className='text-lg font-semibold mb-3'>
                  Loading photos...
                </h3>
                <PhotosSkeleton />
              </div>
            ) : photoQuery.data ? (
              <div className='flex flex-col'>
                {/* Cache info and result count */}
                <div className='p-3 border rounded-md mb-4 bg-muted/30'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-medium'>Cache Hit:</span>
                    <span>{photoQuery.data.cacheHit ? 'Yes' : 'No'}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium'>Total Photos:</span>
                    <span>{photoQuery.data.count}</span>
                  </div>
                </div>

                <Separator className='my-4' />

                {/* Display results */}
                {showRawJson ? (
                  <div className='relative h-[500px] overflow-hidden'>
                    <div className='absolute inset-0 overflow-auto bg-muted p-4 rounded-md'>
                      <pre className='text-xs'>
                        {JSON.stringify(photoQuery.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-5'>
                    {photoQuery.data.data && photoQuery.data.data.length > 0 ? (
                      <div className='space-y-5'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                          {photoQuery.data.data.map((photoUrl, index) => (
                            <div
                              key={index}
                              className='border rounded-sm overflow-hidden border-muted bg-muted/30 shadow-sm hover:shadow-md cursor-pointer transition-shadow'
                              onClick={() => setSelectedPhotoIndex(index)}
                            >
                              <div className='relative w-full h-36'>
                                <Image
                                  src={photoUrl.toString()}
                                  alt={`Photo ${index + 1}`}
                                  fill
                                  sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
                                  unoptimized={true}
                                  className='object-cover'
                                />
                              </div>
                              <div className='text-xs p-2 text-center'>
                                Photo {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Selected photo view */}
                        {selectedPhotoIndex !== null && (
                          <div className='mt-5 space-y-3'>
                            <div className='flex justify-between items-center'>
                              <p className='font-medium'>Selected Photo:</p>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setSelectedPhotoIndex(null)}
                              >
                                Close
                              </Button>
                            </div>
                            <div className='border rounded-md p-4 overflow-hidden bg-muted/30'>
                              <div className='relative w-full aspect-video'>
                                <Image
                                  src={photoQuery.data.data[
                                    selectedPhotoIndex
                                  ].toString()}
                                  alt={`Selected photo ${selectedPhotoIndex + 1
                                    }`}
                                  fill
                                  unoptimized={true}
                                  className='object-contain'
                                />
                              </div>
                              <div className='mt-2 pt-2 border-t flex justify-between items-center'>
                                <span className='text-sm'>
                                  Photo {selectedPhotoIndex + 1} of{' '}
                                  {photoQuery.data.data.length}
                                </span>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => {
                                    navigator.clipboard
                                      .writeText(
                                        photoQuery.data.data[
                                          selectedPhotoIndex
                                        ].toString()
                                      )
                                      .then(() =>
                                        toast.success(
                                          'Photo URL copied to clipboard'
                                        )
                                      )
                                      .catch(() =>
                                        toast.error('Failed to copy photo URL')
                                      );
                                  }}
                                >
                                  Copy URL
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className='flex flex-col items-center justify-center py-8'>
                        <p className='text-muted-foreground'>
                          No photos found for this place
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              !photoQuery.isError && (
                <div className='flex flex-col items-center justify-center h-64 text-center'>
                  <p className='text-muted-foreground'>
                    Enter a place ID and click &quot;Get Photos&quot; to see
                    results
                  </p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component
export default function PlacesPhotosPage() {
  return (
    <div className='flex flex-col gap-8 p-4'>
      {/* Title + Description */}
      <div>
        <h1 className='text-2xl font-bold'>Place Photos</h1>
        <p className='text-sm text-muted-foreground'>
          View photos for a specific place using its Place ID.
        </p>
      </div>

      <Suspense fallback={<PhotosSkeleton />}>
        <PhotosForm />
      </Suspense>
    </div>
  );
}
