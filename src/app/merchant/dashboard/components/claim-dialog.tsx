'use client';

import type { Dispatch } from 'react';
import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import type { MerchantPlaceSearchResponse } from '@/types/admin-search';
import type { ErrorResponse } from '@/types/error-response';
import type { DashboardAction, DashboardState } from '../reducer';

export type ClaimPlaceFormValues = z.infer<typeof claimPlaceFormSchema>;

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

type ClaimFormProps = {
  isSubmitting: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: ClaimPlaceFormValues) => Promise<void>;
};

function ClaimForm({
  isSubmitting,
  isPending,
  onClose,
  onSubmit,
}: ClaimFormProps) {
  const form = useForm<ClaimPlaceFormValues>({
    resolver: zodResolver(claimPlaceFormSchema),
    defaultValues: {
      businessName: '',
      city: '',
      state: '',
    },
  });

  const handleClose = useCallback(() => {
    form.reset({
      businessName: '',
      city: '',
      state: '',
    });
    onClose();
  }, [form, onClose]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='businessName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter your business name' {...field} />
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
                  <Input placeholder='ST' maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex justify-end gap-4 pt-4'>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting || isPending}>
            {isSubmitting || isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

type ClaimDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  state: DashboardState;
  dispatch: Dispatch<DashboardAction>;
};

export function ClaimDialog({
  isOpen,
  onOpenChange,
  state,
  dispatch,
}: ClaimDialogProps) {
  const searchPlaceMutation = useMutation<
    MerchantPlaceSearchResponse,
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

  const handleClaimSubmit = useCallback(
    async (data: ClaimPlaceFormValues) => {
      try {
        dispatch({ type: 'SET_SUBMITTING', payload: true });
        dispatch({ type: 'START_LOADING' });

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

        dispatch({
          type: 'SHOW_LIST',
          payload: { searchResults: searchResult.data },
        });
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
    },
    [dispatch, searchPlaceMutation]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Claim Your Business</DialogTitle>
          <DialogDescription>
            Fill out this form to start the process of claiming your business on
            Emoji Map.
          </DialogDescription>
        </DialogHeader>
        <ClaimForm
          isSubmitting={state.isSubmitting}
          isPending={searchPlaceMutation.isPending}
          onClose={() => onOpenChange(false)}
          onSubmit={handleClaimSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
