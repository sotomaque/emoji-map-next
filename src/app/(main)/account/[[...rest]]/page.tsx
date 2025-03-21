'use client';

import { SignedIn, SignedOut, SignInButton, UserProfile } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const { theme } = useTheme();
  return (
    <>
      <SignedOut>
        <div className='max-w-md w-full bg-white/90 dark:bg-card/80 backdrop-blur-md text-card-foreground rounded-lg shadow-lg border border-purple-200 dark:border-white/10 p-8 z-10'>
          <div className='text-center mb-6'>
            <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>
              Account Login
            </h1>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              Sign in to access your account
            </p>
          </div>
          <div className='flex justify-center items-center'>
            <SignInButton
              mode='modal'
              appearance={{
                baseTheme: theme === 'dark' ? dark : undefined,
                elements: {
                  footerAction: { display: 'none' },
                  socialButtonsRoot: { display: 'none' },
                  dividerRow: { display: 'none' },
                },
              }}
            >
              <Button
                type='button'
                className='px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105
                dark:text-white'
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <UserProfile
          appearance={{
            baseTheme: theme === 'dark' ? dark : undefined,
          }}

        />
      </SignedIn>
    </>
  );
}
