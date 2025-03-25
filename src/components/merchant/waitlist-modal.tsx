'use client';

import { Waitlist } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export function WaitlistDialog({ trigger }: { trigger: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        hideCloseButton
        className='bg-transparent border-none sm:max-w-[425px] justify-center'
      >
        <VisuallyHidden>
          <DialogTitle>Join Waitlist</DialogTitle>
        </VisuallyHidden>
        <Waitlist
          appearance={{ baseTheme: theme === 'dark' ? dark : undefined }}
        />
      </DialogContent>
    </Dialog>
  );
}
