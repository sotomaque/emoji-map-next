import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
} from '@clerk/nextjs';
import ThemedUserButton from '@/components/auth/themed-user-button';
import { ModeToggle } from '@/components/nav/mode-toggle/mode-toggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {/* TODO: EXTRACT HEADER */}
      <header className='absolute top-0 left-0 right-0 z-50 p-6'>
        <div className='flex justify-between'>
          {/* Profile / Login / Signup */}
          <>
            <SignedOut>
              <SignInButton />
              {/* TODO style button */}
            </SignedOut>
            <SignedIn>
              <ThemedUserButton />
            </SignedIn>
          </>

          {/* Dark mode toggle */}
          <ModeToggle
            className={`
          bg-gray-500
          dark:bg-gray-800 dark:hover:bg-gray-700 
          border-none
          rounded-full`}
          />
        </div>
      </header>
      {children}
    </ClerkProvider>
  );
}
