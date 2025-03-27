'use client';

import { useReducer } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Star,
  Image as ImageIcon,
  MessageSquare,
  Store,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  AdminSearchResult,
  AdminSearchResponse,
} from '@/types/admin-search';
import type { ErrorResponse } from '@/types/error-response';
import type { Merchant, Place, Photo, Rating, Review } from '@prisma/client';

// Types for API responses
type PlaceWithRelations = Place & {
  photos: Photo[];
  ratings: Rating[];
  reviews: Review[];
};

type MerchantResponse = {
  merchant:
    | (Merchant & {
        places: PlaceWithRelations[];
      })
    | null;
};

type AssociateResponse = {
  success: boolean;
  data?: {
    merchant: MerchantResponse['merchant'];
  };
  error?: string;
};

type LoadingStep = {
  message: string;
  status: 'pending' | 'complete' | 'error';
};

type DialogState = 'closed' | 'claim' | 'loading' | 'list' | 'verify';

interface DashboardState {
  dialogState: DialogState;
  loadingSteps: LoadingStep[];
  isSubmitting: boolean;
  searchResults: AdminSearchResult[];
  selectedPlace: AdminSearchResult | null;
}

type DashboardAction =
  | { type: 'OPEN_CLAIM_DIALOG' }
  | { type: 'START_LOADING' }
  | {
      type: 'UPDATE_LOADING_STEP';
      payload: { index: number; status: LoadingStep['status'] };
    }
  | { type: 'SHOW_LIST'; payload: { searchResults: AdminSearchResult[] } }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'HANDLE_ERROR'; payload: { stepIndex: number } }
  | { type: 'SELECT_PLACE'; payload: AdminSearchResult };

const initialState: DashboardState = {
  dialogState: 'closed',
  loadingSteps: [{ message: 'Finding your business', status: 'pending' }],
  isSubmitting: false,
  searchResults: [],
  selectedPlace: null,
};

const verifyPhoneFormSchema = z.object({
  phoneNumber: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
});

type VerifyPhoneFormValues = z.infer<typeof verifyPhoneFormSchema>;

const claimPlaceFormSchema = z.object({
  businessName: z.string().min(2, {
    message: 'Business name must be at least 2 characters.',
  }),
  city: z.string().min(2, {
    message: 'City must be at least 2 characters.',
  }),
  state: z.string().length(2, {
    message: 'Please enter a valid state abbreviation.',
  }),
});

type ClaimPlaceFormValues = z.infer<typeof claimPlaceFormSchema>;

// Helper function to strip non-numeric characters
function stripNonNumeric(str: string): string {
  return str.replace(/\D/g, '');
}

// Helper function to format phone number
function formatPhoneNumber(value: string): string {
  const numbers = stripNonNumeric(value);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6)
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
    6,
    10
  )}`;
}

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case 'OPEN_CLAIM_DIALOG':
      return {
        ...state,
        dialogState: 'claim',
        loadingSteps: initialState.loadingSteps,
        searchResults: [],
        selectedPlace: null,
      };
    case 'START_LOADING':
      return {
        ...state,
        dialogState: 'loading',
        loadingSteps: initialState.loadingSteps,
      };
    case 'SHOW_LIST':
      return {
        ...state,
        dialogState: 'list',
        searchResults: action.payload.searchResults,
      };
    case 'SELECT_PLACE':
      return {
        ...state,
        dialogState: 'verify',
        selectedPlace: action.payload,
      };
    case 'UPDATE_LOADING_STEP':
      return {
        ...state,
        loadingSteps: state.loadingSteps.map((step, i) =>
          i === action.payload.index
            ? { ...step, status: action.payload.status }
            : step
        ),
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        dialogState: 'closed',
        loadingSteps: initialState.loadingSteps,
        searchResults: [],
        selectedPlace: null,
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case 'HANDLE_ERROR':
      return {
        ...state,
        loadingSteps: state.loadingSteps.map((step, i) =>
          i === action.payload.stepIndex ? { ...step, status: 'error' } : step
        ),
      };
    default:
      return state;
  }
}

export default function MerchantDashboard() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const { data: merchantData, isLoading: isLoadingMerchant } =
    useQuery<MerchantResponse>({
      queryKey: ['merchant'],
      queryFn: async () => {
        const response = await fetch('/api/merchant');
        if (!response.ok) {
          throw new Error('Failed to fetch merchant data');
        }
        return response.json();
      },
    });

  const form = useForm<ClaimPlaceFormValues>({
    resolver: zodResolver(claimPlaceFormSchema),
    defaultValues: {
      businessName: '',
      city: '',
      state: '',
    },
  });

  const verifyForm = useForm<VerifyPhoneFormValues>({
    resolver: zodResolver(verifyPhoneFormSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  const searchPlaceMutation = useMutation<
    AdminSearchResponse,
    Error,
    { name: string; city: string; state: string }
  >({
    mutationFn: async (data) => {
      const response = await fetch('/api/merchant/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.error || 'Failed to search for place');
      }
      return response.json();
    },
  });

  const queryClient = useQueryClient();

  const associatePlaceMutation = useMutation<AssociateResponse, Error, string>({
    mutationFn: async (placeId) => {
      const response = await fetch('/api/merchant/associate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId }),
      });
      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.error || 'Failed to associate place');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the merchant query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
    },
  });

  async function onSubmit(data: ClaimPlaceFormValues) {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'START_LOADING' });

      // Search for place
      const searchResult = await searchPlaceMutation.mutateAsync({
        name: data.businessName,
        city: data.city,
        state: data.state,
      });

      if (searchResult.data?.length === 0) {
        dispatch({ type: 'HANDLE_ERROR', payload: { stepIndex: 0 } });
        toast.error(
          'No matching places found. Please check your business details.'
        );
        return;
      }

      // Show list of places
      dispatch({
        type: 'SHOW_LIST',
        payload: { searchResults: searchResult.data },
      });
      form.reset();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to process your request. Please try again.');
      }
      console.error(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }

  async function onVerifySubmit(data: VerifyPhoneFormValues) {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });

      // Get only numeric values for comparison
      const inputNumber = stripNonNumeric(data.phoneNumber);
      const placeNumber = stripNonNumeric(
        state.selectedPlace?.nationalPhoneNumber || ''
      );

      if (inputNumber === placeNumber) {
        // Call the associate endpoint
        const result = await associatePlaceMutation.mutateAsync(
          state.selectedPlace!.id
        );
        if (result.success) {
          toast.success('Place claimed successfully!');
          dispatch({ type: 'CLOSE_DIALOG' });
        } else {
          toast.error(result.error || 'Failed to claim place');
        }
      } else {
        toast.error('Phone number does not match our records.');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to verify phone number. Please try again.');
      }
      console.error(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-bold'>Merchant Dashboard</h1>
        <Button variant='outline'>Settings</Button>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Places
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              {isLoadingMerchant ? (
                <Skeleton className='h-8 w-16' />
              ) : (
                <div className='text-2xl font-bold'>
                  {merchantData?.merchant?.places?.length || 0}
                </div>
              )}
              <Store className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              {isLoadingMerchant ? (
                <Skeleton className='h-8 w-16' />
              ) : (
                <div className='text-2xl font-bold'>
                  {merchantData?.merchant?.places?.length
                    ? (
                        merchantData.merchant.places.reduce<number>(
                          (acc, place) =>
                            acc +
                            place.ratings.reduce<number>(
                              (sum, r) => sum + r.rating,
                              0
                            ) /
                              (place.ratings.length || 1),
                          0
                        ) / merchantData.merchant.places.length
                      ).toFixed(1)
                    : '--'}
                </div>
              )}
              <Star className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              {isLoadingMerchant ? (
                <Skeleton className='h-8 w-16' />
              ) : (
                <div className='text-2xl font-bold'>
                  {merchantData?.merchant?.places?.reduce<number>(
                    (acc, place) => acc + (place.reviews?.length || 0),
                    0
                  ) || 0}
                </div>
              )}
              <MessageSquare className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              {isLoadingMerchant ? (
                <Skeleton className='h-8 w-16' />
              ) : (
                <div className='text-2xl font-bold'>
                  {merchantData?.merchant?.places?.reduce<number>(
                    (acc, place) => acc + (place.photos?.length || 0),
                    0
                  ) || 0}
                </div>
              )}
              {}
              <ImageIcon className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Places List */}
      <div className='grid grid-cols-1 gap-6'>
        {isLoadingMerchant ? (
          <Card>
            <CardContent className='p-6'>
              <Skeleton className='h-24 w-full' />
            </CardContent>
          </Card>
        ) : merchantData?.merchant?.places?.length ? (
          merchantData.merchant.places.map((place: PlaceWithRelations) => (
            <Card key={place.id}>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  {/* Left Column - Basic Info */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Store className='h-4 w-4 text-muted-foreground' />
                      <h3 className='font-semibold'>{place.name}</h3>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4 text-muted-foreground' />
                      <p className='text-sm text-muted-foreground'>
                        {place.description}
                      </p>
                    </div>
                    {place.address && (
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-muted-foreground' />
                        <p className='text-sm text-muted-foreground'>
                          {place.address}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Middle Column - Stats */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Star className='h-4 w-4 text-muted-foreground' />
                      <p className='text-sm text-muted-foreground'>
                        {place.ratings.length > 0
                          ? (
                              place.ratings.reduce(
                                (sum, r) => sum + r.rating,
                                0
                              ) / place.ratings.length
                            ).toFixed(1)
                          : '--'}{' '}
                        ({place.ratings.length} ratings)
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MessageSquare className='h-4 w-4 text-muted-foreground' />
                      <p className='text-sm text-muted-foreground'>
                        {place.reviews.length} reviews
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <ImageIcon className='h-4 w-4 text-muted-foreground' />
                      <p className='text-sm text-muted-foreground'>
                        {place.photos.length} photos
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Actions */}
                  <div className='flex flex-col gap-4'>
                    <Button variant='outline' size='sm'>
                      View Details
                    </Button>
                    <Button variant='outline' size='sm'>
                      Edit Place
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className='p-6'>
              <div className='text-center py-6'>
                <Store className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>No Places Yet</h3>
                <p className='text-muted-foreground mb-4'>
                  You haven&apos;t claimed any places yet. Start by claiming
                  your first business.
                </p>
                <Button onClick={() => dispatch({ type: 'OPEN_CLAIM_DIALOG' })}>
                  Claim a Place
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='h-6 w-6' />
              Claim Your Place
            </CardTitle>
            <CardDescription>
              Start managing your business by claiming ownership of your Google
              Places listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog
              open={state.dialogState === 'claim'}
              onOpenChange={(open) =>
                dispatch(
                  open
                    ? { type: 'OPEN_CLAIM_DIALOG' }
                    : { type: 'CLOSE_DIALOG' }
                )
              }
            >
              <DialogTrigger asChild>
                <Button>Claim a Place</Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                  <DialogTitle>Claim Your Business</DialogTitle>
                  <DialogDescription>
                    Fill out this form to start the process of claiming your
                    business on Emoji Map.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={form.control}
                      name='businessName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Enter your business name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='city'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder='City' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='state'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='ST'
                                maxLength={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex justify-end gap-4 pt-4'>
                      <Button
                        variant='outline'
                        onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}
                      >
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        disabled={
                          state.isSubmitting || searchPlaceMutation.isPending
                        }
                      >
                        {state.isSubmitting || searchPlaceMutation.isPending
                          ? 'Submitting...'
                          : 'Submit'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Loading Dialog */}
            <Dialog
              open={state.dialogState === 'loading'}
              onOpenChange={(open) =>
                !open && dispatch({ type: 'CLOSE_DIALOG' })
              }
            >
              <DialogContent className='sm:max-w-[400px]'>
                <DialogHeader>
                  <DialogTitle>Processing Your Request</DialogTitle>
                  <DialogDescription>
                    Please wait while we process your business claim request.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-6 py-4'>
                  {state.loadingSteps.map((step, index) => (
                    <div key={index} className='flex items-center gap-4'>
                      <div className='flex-1'>
                        {step.status === 'pending' ? (
                          <Skeleton className='h-4 w-[200px]' />
                        ) : (
                          <p
                            className={
                              step.status === 'error'
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                            }
                          >
                            {step.message}
                          </p>
                        )}
                      </div>
                      <div className='flex-shrink-0'>
                        {step.status === 'pending' && (
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        )}
                        {step.status === 'complete' && (
                          <div className='h-4 w-4 rounded-full bg-primary' />
                        )}
                        {step.status === 'error' && (
                          <div className='h-4 w-4 rounded-full bg-destructive' />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Place List Dialog */}
            <Dialog
              open={state.dialogState === 'list'}
              onOpenChange={(open) =>
                !open && dispatch({ type: 'CLOSE_DIALOG' })
              }
            >
              <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                  <DialogTitle>Found Places</DialogTitle>
                  <DialogDescription>
                    Here are the places that match your search criteria.
                  </DialogDescription>
                </DialogHeader>
                <div className='overflow-y-auto max-h-[400px] pr-2 -mr-2'>
                  <div className='space-y-4'>
                    {state.searchResults.map((place) => (
                      <div
                        key={place.id}
                        className='flex items-center space-x-4 p-4 rounded-lg border'
                      >
                        <div className='flex-1 space-y-2'>
                          <div className='font-medium'>{place.displayName}</div>
                          <div className='text-sm text-muted-foreground'>
                            {place.formattedAddress}
                          </div>
                        </div>
                        <Button
                          onClick={() =>
                            dispatch({ type: 'SELECT_PLACE', payload: place })
                          }
                        >
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='flex justify-end gap-4 pt-4'>
                  <Button
                    variant='outline'
                    onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Verify Phone Dialog */}
            <Dialog
              open={state.dialogState === 'verify'}
              onOpenChange={(open) =>
                !open && dispatch({ type: 'CLOSE_DIALOG' })
              }
            >
              <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                  <DialogTitle>Verify Your Business</DialogTitle>
                  <DialogDescription>
                    Please enter the phone number associated with{' '}
                    {state.selectedPlace?.displayName} to verify ownership.
                  </DialogDescription>
                </DialogHeader>
                <Form {...verifyForm}>
                  <form
                    onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={verifyForm.control}
                      name='phoneNumber'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='(555) 555-5555'
                              maxLength={14}
                              {...field}
                              value={formatPhoneNumber(field.value)}
                              onChange={(e) => {
                                const value = e.target.value;
                                const numbers = stripNonNumeric(value);
                                if (numbers.length <= 10) {
                                  field.onChange(numbers);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='flex justify-end gap-4 pt-4'>
                      <Button
                        variant='outline'
                        onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}
                      >
                        Cancel
                      </Button>
                      <Button type='submit' disabled={state.isSubmitting}>
                        {state.isSubmitting ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
