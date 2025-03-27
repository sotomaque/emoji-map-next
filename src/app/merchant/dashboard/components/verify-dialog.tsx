'use client';

import type { ActionDispatch } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import type { ErrorResponse } from '@/types/error-response';
import { formatPhoneNumber } from '../utils/format-phone-number';
import { stripNonNumeric } from '../utils/strip-non-numeric';
import type { MerchantResponse } from '../page';
import type { DashboardAction, DashboardState } from '../reducer';

type AssociateResponse = {
  success: boolean;
  data?: {
    merchant: MerchantResponse['merchant'];
  };
  error?: string;
};

type VerifyDialogProps = {
  handleCloseDialog: () => void;
  state: DashboardState;
  dispatch: ActionDispatch<[action: DashboardAction]>;
};

const verifyPhoneFormSchema = z.object({
  phoneNumber: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
});

type VerifyPhoneFormValues = z.infer<typeof verifyPhoneFormSchema>;

export function VerifyDialog({
  handleCloseDialog,
  state,
  dispatch,
}: VerifyDialogProps) {
  const queryClient = useQueryClient();

  const verifyForm = useForm<VerifyPhoneFormValues>({
    resolver: zodResolver(verifyPhoneFormSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

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
    <Dialog
      open={state.dialogState === 'verify'}
      onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        }
      }}
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
              <Button variant='outline' onClick={handleCloseDialog}>
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
  );
}
