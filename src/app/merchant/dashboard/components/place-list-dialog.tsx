'use client';

import type { ActionDispatch } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DashboardAction, DashboardState } from '../reducer';

export function PlaceListDialog({
  handleCloseDialog,
  state,
  dispatch,
}: {
  handleCloseDialog: () => void;
  state: DashboardState;
  dispatch: ActionDispatch<[action: DashboardAction]>;
}) {
  return (
    <Dialog
      open={state.dialogState === 'list'}
      onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        }
      }}
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
          <Button variant='outline' onClick={handleCloseDialog}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
